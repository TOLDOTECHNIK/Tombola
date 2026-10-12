#!/usr/bin/env node
/**
 * Builds and packages the Tombola Studio Neutralinojs app.
 *
 * Replaces the previous `electron-vite build && electron-builder` pipeline:
 * `neu build` bundles the renderer and every platform binary, this script
 * turns the result into platform packages named like electron-builder's
 * artifacts: `${productName}-${version}-${os}-${arch}.${ext}`.
 *
 * The Neutralinojs CLI hardcodes a root `bin/` folder for the framework
 * binaries it downloads (`neu update`) and reads (`neu build`/`neu run`), so
 * those binaries are only placed there transiently: they are restored from a
 * cache under `node_modules/.cache/` before a build (or before `neu run`) and
 * retired back into that cache afterwards. The project root never keeps a
 * generated `bin/` folder.
 *
 * Usage:
 *   node scripts/dist.mjs [--platform mac|win|linux|all] [--arch x64|arm64|universal]
 *                         [--output dist] [--skip-build] [--build-only] [--external-resources]
 *                         [--restore-framework]
 *
 * By default the framework binaries embed the web assets, so every platform
 * artifact is a single self-contained file (no resources.neu sidecar). Pass
 * --external-resources to build the classic two-file bundle instead.
 * Pass --build-only to just compile bin/ and www/ into dist/ without creating
 * platform packages.
 */
import { spawnSync } from 'node:child_process'
import { chmodSync, copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const neutralinoConfig = JSON.parse(readFileSync(join(root, 'neutralino.config.json'), 'utf8'))
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

const APP_NAME = neutralinoConfig.applicationName ?? 'Tombola Studio'
const VERSION = neutralinoConfig.version
const BINARY_NAME = neutralinoConfig.cli.binaryName
const FRAMEWORK_VERSION = neutralinoConfig.cli.binaryVersion
const BUNDLE_DIR = join(root, 'dist', 'bin')
/**
 * The Neutralinojs CLI hardcodes `bin/` for the framework binaries it
 * downloads and reads, so it is created only transiently and its contents are
 * cached here so the project root stays free of generated files.
 */
const BIN_DIR = join(root, 'bin')
const FRAMEWORK_CACHE_DIR = join(root, 'node_modules', '.cache', 'tombola-framework')
const RESOURCES = join(BUNDLE_DIR, 'resources.neu')
/** `neu build --embed-resources` inlines assets and removes this sidecar file. */
const hasResourcesFile = () => existsSync(RESOURCES)
const NEU_OUTPUT_DIR = join(root, 'dist', BINARY_NAME)
/** Renderer output: `www/` always compiles into `www/` (see vite.config.mts). */
const WEB_OUTPUT_DIR = join(root, 'dist', 'www')
const LEGACY_WEB_DIR = join(root, 'www')
const ICON_PNG = join(root, 'src/public/icon.png')

/** platform -> neutralino binary suffix, per Electron-style os names. */
const BINARIES = {
  mac: { x64: `${BINARY_NAME}-mac_x64`, arm64: `${BINARY_NAME}-mac_arm64`, universal: `${BINARY_NAME}-mac_universal` },
  win: { x64: `${BINARY_NAME}-win_x64.exe` },
  linux: { x64: `${BINARY_NAME}-linux_x64`, arm64: `${BINARY_NAME}-linux_arm64` }
}

/** platform -> framework file names as downloaded into bin/. */
const FRAMEWORK_BINARIES = {
  mac: { x64: 'neutralino-mac_x64', arm64: 'neutralino-mac_arm64', universal: 'neutralino-mac_universal' },
  win: { x64: 'neutralino-win_x64.exe' },
  linux: { x64: 'neutralino-linux_x64', arm64: 'neutralino-linux_arm64' }
}

const DEFAULT_ARCHES = { mac: ['x64', 'arm64'], win: ['x64'], linux: ['x64'] }
const MACOS_SIGN_IDENTITY = process.env.MACOS_SIGN_IDENTITY?.trim() || null

const args = process.argv.slice(2)
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`)
  return index === -1 ? fallback : args[index + 1]
}
const hasFlag = (name) => args.includes(`--${name}`)

const HOST_PLATFORM = { darwin: 'mac', win32: 'win', linux: 'linux' }[process.platform]
const requestedPlatform = option('platform', HOST_PLATFORM)
const platforms = requestedPlatform === 'all' ? ['mac', 'win', 'linux'] : [requestedPlatform]
const outputDir = resolve(root, option('output', 'dist'))
const skipBuild = hasFlag('skip-build')
const buildOnly = hasFlag('build-only')
const embedResources = !hasFlag('external-resources')
const archOption = option('arch', null)

/** Launched by the dev/start scripts so `neu run` finds the framework binaries. */
if (hasFlag('restore-framework')) {
  ensureFrameworkBinaries()
  process.exit(0)
}

const artifacts = []
const skipped = []

if (VERSION !== pkg.version) {
  console.error(
    `dist: version mismatch — neutralino.config.json declares ${VERSION} but package.json is ${pkg.version}. ` +
      'Keep both versions in sync before packaging.'
  )
  process.exit(1)
}

function log(message) {
  console.log(`dist: ${message}`)
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd ?? root,
    stdio: options.quiet ? 'pipe' : 'inherit',
    ...(options.env ? { env: options.env } : {})
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(`${command} ${commandArgs.join(' ')} exited with code ${result.status}${options.quiet ? `: ${result.stderr}` : ''}`)
  }
  return result
}

function hasCommand(command) {
  const probe = spawnSync(command, ['--version'], { stdio: 'pipe' })
  return !probe.error && probe.status !== 127
}

/** Cross-platform zip: uses whatever archiver the host provides. Returns the path it wrote. */
function zip(sourceDir, target) {
  if (hasCommand('zip')) {
    run('zip', ['-q', '-r', '-X', target, '.'], { cwd: sourceDir })
    return target
  }
  if (process.platform === 'darwin') {
    run('ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', sourceDir, target])
    return target
  }
  if (process.platform === 'win32' && hasCommand('tar')) {
    run('tar', ['-a', '-c', '-f', target, '-C', sourceDir, '.'])
    return target
  }
  const fallback = target.replace(/\.zip$/, '.tar.gz')
  run('tar', ['-czf', fallback, '-C', sourceDir, '.'])
  log(`no zip tool available — wrote ${fallback} instead`)
  return fallback
}

function iconIcns(workDir) {
  const iconset = join(workDir, "icon.iconset");
  mkdirSync(iconset, { recursive: true });
  const sizes = [16, 32, 128, 256, 512];
  for (const size of sizes) {
    for (const scale of ["", "@2x"]) {
      const dimension = scale === "@2x" ? size * 2 : size;
      run("sips", ["-z", String(dimension), String(dimension), ICON_PNG, "--out", join(iconset, `icon_${size}x${size}${scale}.png`)], { quiet: true });
    }
  }
  const icns = join(workDir, "icon.icns");
  run("iconutil", ["-c", "icns", iconset, "-o", icns], { quiet: true });
  return icns;
}

function artifact(name, path) {
  artifacts.push(path)
  const size = (statSync(path).size / 1024 / 1024).toFixed(1)
  log(`created ${name} (${size} MB)`)
}

function cleanPreviousArtifacts() {
  mkdirSync(outputDir, { recursive: true })
  const keep = new Set([BINARY_NAME])
  for (const entry of readdirSync(outputDir)) {
    const full = join(outputDir, entry)
    if (keep.has(entry) || !statSync(full).isFile()) continue
    if (/\.(dmg|zip|exe|AppImage|deb|tar\.gz)$/.test(entry)) rmSync(full)
  }
}

/* ------------------------------- mac (.app/.dmg/.zip) ------------------------------ */

function packageMac(arch, workDir) {
  const binary = BINARIES.mac[arch]
  const source = join(BUNDLE_DIR, binary)
  if (!existsSync(source)) throw new Error(`missing ${source} — run neu build first`)

  const archDir = join(workDir, arch)
  const appBundle = join(archDir, `${APP_NAME}.app`)
  const macOsDir = join(appBundle, 'Contents', 'MacOS')
  const resourcesDir = join(appBundle, 'Contents', 'Resources')
  rmSync(appBundle, { recursive: true, force: true })
  mkdirSync(macOsDir, { recursive: true })
  mkdirSync(resourcesDir, { recursive: true })

  copyFileSync(source, join(macOsDir, binary))
  chmodSync(join(macOsDir, binary), 0o755)
  if (hasResourcesFile()) copyFileSync(RESOURCES, join(macOsDir, 'resources.neu'))

  const icns = existsSync(ICON_PNG) && hasCommand('sips') && hasCommand('iconutil') ? iconIcns(archDir) : null
  if (icns) {
    copyFileSync(icns, join(resourcesDir, 'icon.icns'))
  } else if (existsSync(ICON_PNG)) {
    skipped.push(`mac/${arch}: .icns icon (sips/iconutil not available)`)
  }

  writeFileSync(
    join(appBundle, 'Contents', 'Info.plist'),
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>de</string>
  <key>CFBundleExecutable</key>
  <string>${binary}</string>
  <key>CFBundleIconFile</key>
  <string>icon.icns</string>
  <key>CFBundleIdentifier</key>
  <string>${neutralinoConfig.applicationId}</string>
  <key>CFBundleName</key>
  <string>${APP_NAME}</string>
  <key>CFBundleDisplayName</key>
  <string>${APP_NAME}</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>${VERSION}</string>
  <key>CFBundleVersion</key>
  <string>${VERSION}</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>LSMinimumSystemVersion</key>
  <string>10.13.0</string>
  <key>NSHighResolutionCapable</key>
  <true/>
</dict>
</plist>
`
  )

  signMacApp(appBundle)

  if (hasCommand('hdiutil')) {
    const dmg = join(outputDir, `${APP_NAME}-${VERSION}-mac-${arch}.dmg`)
    run('hdiutil', ['create', '-volname', APP_NAME, '-srcfolder', appBundle, '-fs', 'HFS+', '-format', 'UDZO', '-ov', '-quiet', dmg])
    if (MACOS_SIGN_IDENTITY && MACOS_SIGN_IDENTITY !== '-') {
      run('codesign', ['--force', '--sign', MACOS_SIGN_IDENTITY, dmg])
    }
    artifact(`${APP_NAME}-${VERSION}-mac-${arch}.dmg`, dmg)
  } else {
    skipped.push(`mac/${arch}: .dmg (hdiutil not available)`)
  }

  if (hasCommand('ditto')) {
    const zipFile = join(outputDir, `${APP_NAME}-${VERSION}-mac-${arch}.zip`)
    run('ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', appBundle, zipFile])
    artifact(`${APP_NAME}-${VERSION}-mac-${arch}.zip`, zipFile)
  } else {
    skipped.push(`mac/${arch}: .zip (ditto not available)`)
  }
}

/**
 * Signs the assembled bundle so it is self-consistent and passes codesign
 * verification. MACOS_SIGN_IDENTITY selects a real Developer ID; without it the
 * bundle is signed ad-hoc, which is still required for a valid app structure.
 */
function signMacApp(appBundle) {
  if (!hasCommand('codesign')) {
    skipped.push(`mac: codesign (codesign not available)`)
    return
  }
  if (MACOS_SIGN_IDENTITY) {
    run('codesign', ['--force', '--deep', '--sign', MACOS_SIGN_IDENTITY, appBundle])
    return
  }
  run('codesign', ['--force', '--deep', '--sign', '-', appBundle])
}

/* ----------------------------------- win (nsis/zip) --------------------------------- */

function packageWin(arch, workDir) {
  const binary = BINARIES.win[arch]
  const source = join(BUNDLE_DIR, binary)
  if (!existsSync(source)) throw new Error(`missing ${source} — run neu build first`)

  // Portable zip: the executable alone when resources are embedded.
  const portableDir = join(workDir, 'portable')
  mkdirSync(portableDir, { recursive: true })
  copyFileSync(source, join(portableDir, binary))
  if (hasResourcesFile()) copyFileSync(RESOURCES, join(portableDir, 'resources.neu'))
  const zipTarget = join(outputDir, `${APP_NAME}-${VERSION}-win-${arch}.zip`)
  const zipFile = zip(portableDir, zipTarget)
  artifact(`${APP_NAME}-${VERSION}-win-${arch}.zip`, zipFile)

  if (!hasCommand('makensis')) {
    skipped.push(`win/${arch}: NSIS installer (makensis not installed)`)
    return
  }
  const installer = join(outputDir, `${APP_NAME}-${VERSION}-win-${arch}-setup.exe`)
  const nsi = join(workDir, 'installer.nsi')
  const installFiles = [
    `  File "${join(portableDir, binary).replace(/\\/g, '\\\\')}"`,
    ...(hasResourcesFile() ? [`  File "${join(portableDir, 'resources.neu').replace(/\\/g, '\\\\')}"`] : [])
  ].join('\n')
  const uninstallDeletes = [
    `  Delete "$INSTDIR\\${binary}"`,
    ...(hasResourcesFile() ? ['  Delete "$INSTDIR\\\\resources.neu"'] : []),
    '  Delete "$INSTDIR\\uninstall.exe"'
  ].join('\n')
  writeFileSync(
    nsi,
    `OutFile "${installer}"
InstallDir "$PROGRAMFILES64\\${APP_NAME}"
RequestExecutionLevel admin

Page directory
Page instfiles

Section "Install"
  SetOutPath "$INSTDIR"
${installFiles}
  CreateDirectory "$SMPROGRAMS\\${APP_NAME}"
  CreateShortcut "$SMPROGRAMS\\${APP_NAME}\\${APP_NAME}.lnk" "$INSTDIR\\${binary}"
  CreateShortcut "$DESKTOP\\${APP_NAME}.lnk" "$INSTDIR\\${binary}"
  WriteUninstaller "$INSTDIR\\uninstall.exe"
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${APP_NAME}" "DisplayName" "${APP_NAME}"
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${APP_NAME}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${APP_NAME}" "UninstallString" "$INSTDIR\\uninstall.exe"
SectionEnd

Section "Uninstall"
${uninstallDeletes}
  RMDir "$INSTDIR"
  Delete "$SMPROGRAMS\\${APP_NAME}.lnk"
  Delete "$DESKTOP\\${APP_NAME}.lnk"
  RMDir "$SMPROGRAMS\\${APP_NAME}"
SectionEnd
`
  )
  run('makensis', [nsi])
  if (!existsSync(installer)) throw new Error('NSIS did not produce the installer')
  artifact(`${APP_NAME}-${VERSION}-win-${arch}-setup.exe`, installer)
}

/* ---------------------------------- linux (AppImage/deb/zip) ------------------------ */

function linuxPayload(arch, targetDir) {
  const binary = BINARIES.linux[arch]
  const source = join(BUNDLE_DIR, binary)
  if (!existsSync(source)) throw new Error(`missing ${source} — run neu build first`)
  mkdirSync(targetDir, { recursive: true })
  copyFileSync(source, join(targetDir, binary))
  chmodSync(join(targetDir, binary), 0o755)
  if (hasResourcesFile()) copyFileSync(RESOURCES, join(targetDir, 'resources.neu'))
  if (existsSync(ICON_PNG)) copyFileSync(ICON_PNG, join(targetDir, `${BINARY_NAME}.png`))
  return binary
}

function desktopEntry(binary) {
  return `[Desktop Entry]
Type=Application
Name=${APP_NAME}
GenericName=Tombola
Comment=${neutralinoConfig.description ?? ''}
Exec=${binary}
Icon=${BINARY_NAME}
Terminal=false
Categories=Utility;
`
}

function packageLinux(arch, workDir) {
  const portableDir = join(workDir, 'portable')
  const binary = linuxPayload(arch, portableDir)
  const zipTarget = join(outputDir, `${APP_NAME}-${VERSION}-linux-${arch}.zip`)
  const zipFile = zip(portableDir, zipTarget)
  artifact(`${APP_NAME}-${VERSION}-linux-${arch}.zip`, zipFile)

  // AppImage
  if (hasCommand('appimagetool')) {
    const appDir = join(workDir, 'AppDir')
    const binDir = join(appDir, 'usr', 'bin')
    linuxPayload(arch, binDir)
    writeFileSync(join(appDir, 'AppRun'), `#!/bin/sh\nHERE="$(dirname "$(readlink -f "$0")")"\nexec "$HERE/usr/bin/${binary}" "$@"\n`)
    chmodSync(join(appDir, 'AppRun'), 0o755)
    writeFileSync(join(appDir, `${BINARY_NAME}.desktop`), desktopEntry(binary))
    if (existsSync(ICON_PNG)) copyFileSync(ICON_PNG, join(appDir, `${BINARY_NAME}.png`))
    const appImage = join(outputDir, `${APP_NAME}-${VERSION}-linux-${arch}.AppImage`)
    run('appimagetool', [appDir, appImage], { env: { ...process.env, ARCH: arch === 'arm64' ? 'aarch64' : 'x86_64' } })
    artifact(`${APP_NAME}-${VERSION}-linux-${arch}.AppImage`, appImage)
  } else {
    skipped.push(`linux/${arch}: AppImage (appimagetool not installed)`)
  }

  // Debian package
  if (hasCommand('dpkg-deb')) {
    const debRoot = join(workDir, 'deb')
    const installDir = join(debRoot, 'opt', BINARY_NAME)
    linuxPayload(arch, installDir)
    mkdirSync(join(debRoot, 'DEBIAN'), { recursive: true })
    writeFileSync(
      join(debRoot, 'DEBIAN', 'control'),
      `Package: ${BINARY_NAME}
Version: ${VERSION}
Section: utils
Priority: optional
Architecture: ${arch === 'arm64' ? 'arm64' : 'amd64'}
Maintainer: ${neutralinoConfig.author ?? 'Tombola Studio'}
Description: ${neutralinoConfig.description ?? APP_NAME}
`
    )
    mkdirSync(join(debRoot, 'usr', 'bin'), { recursive: true })
    writeFileSync(join(debRoot, 'usr', 'bin', BINARY_NAME), `#!/bin/sh\ncd /opt/${BINARY_NAME}\nexec ./${binary} "$@"\n`)
    chmodSync(join(debRoot, 'usr', 'bin', BINARY_NAME), 0o755)
    mkdirSync(join(debRoot, 'usr', 'share', 'applications'), { recursive: true })
    writeFileSync(join(debRoot, 'usr', 'share', 'applications', `${BINARY_NAME}.desktop`), desktopEntry(BINARY_NAME))
    if (existsSync(ICON_PNG)) {
      mkdirSync(join(debRoot, 'usr', 'share', 'pixmaps'), { recursive: true })
      copyFileSync(ICON_PNG, join(debRoot, 'usr', 'share', 'pixmaps', `${BINARY_NAME}.png`))
    }
    const deb = join(outputDir, `${APP_NAME}-${VERSION}-linux-${arch}.deb`)
    run('dpkg-deb', ['--build', '--root-owner-group', debRoot, deb])
    artifact(`${APP_NAME}-${VERSION}-linux-${arch}.deb`, deb)
  } else {
    skipped.push(`linux/${arch}: .deb package (dpkg-deb not installed)`)
  }
}

/* --------------------------------------- main --------------------------------------- */

function missingFrameworkBinaries() {
  const missing = []
  for (const platform of platforms) {
    const arches = archOption ? [archOption] : DEFAULT_ARCHES[platform]
    for (const arch of arches) {
      const binary = FRAMEWORK_BINARIES[platform][arch]
      if (binary && !existsSync(join(BIN_DIR, binary))) missing.push(binary)
    }
  }
  return missing
}

/** Copies cached framework binaries back into the hardcoded root `bin/` folder. */
function restoreFrameworkBinaries() {
  if (!existsSync(FRAMEWORK_CACHE_DIR)) return
  mkdirSync(BIN_DIR, { recursive: true })
  for (const entry of readdirSync(FRAMEWORK_CACHE_DIR)) {
    copyFileSync(join(FRAMEWORK_CACHE_DIR, entry), join(BIN_DIR, entry))
  }
}

/** Caches the framework binaries and removes the generated root `bin/` folder. */
function retireFrameworkBinaries() {
  if (!existsSync(BIN_DIR)) return
  rmSync(FRAMEWORK_CACHE_DIR, { recursive: true, force: true })
  cpSync(BIN_DIR, FRAMEWORK_CACHE_DIR, { recursive: true })
  rmSync(BIN_DIR, { recursive: true, force: true })
  log(`retired framework binaries out of the project root into ${FRAMEWORK_CACHE_DIR}`)
}

/** Ensures the framework binaries are in root `bin/` for a build, restoring from cache or downloading. */
function ensureFrameworkBinaries() {
  if (missingFrameworkBinaries().length === 0) return
  restoreFrameworkBinaries()
  if (missingFrameworkBinaries().length === 0) return
  log(`bin/ is missing framework binaries — fetching pinned Neutralinojs framework v${FRAMEWORK_VERSION} with neu update...`)
  run('npx', ['neu', 'update'])
  const missing = missingFrameworkBinaries()
  if (missing.length > 0) {
    console.error(
      `dist: missing framework binaries (${missing.join(', ')}) even after "neu update". ` +
        `Run "npx neu update" to fetch the pinned framework v${FRAMEWORK_VERSION} — ` +
        'do not use "neu update --latest", which ignores the pinned version.'
    )
    process.exit(1)
  }
}

if (!skipBuild) {
  ensureFrameworkBinaries()
  log(embedResources ? 'building app bundle with neu build (resources embedded)...' : 'building app bundle with neu build...')
  rmSync(NEU_OUTPUT_DIR, { recursive: true, force: true })
  run('npx', ['neu', 'build', ...(embedResources ? ['--embed-resources'] : [])])
  mkdirSync(BUNDLE_DIR, { recursive: true })
  for (const entry of readdirSync(NEU_OUTPUT_DIR)) {
    if (entry.startsWith(BINARY_NAME)) {
      cpSync(join(NEU_OUTPUT_DIR, entry), join(BUNDLE_DIR, entry), { recursive: true })
    }
  }
}

if (!skipBuild) retireFrameworkBinaries()
if (!hasResourcesFile()) {
  log('no resources.neu — binaries carry their own embedded assets')
}

if (buildOnly) {
  console.log('')
  log(`compiled bin/ -> ${BUNDLE_DIR}`)
  log(`compiled www/ -> ${WEB_OUTPUT_DIR}`)
  log('done — build only, no platform packages created')
  process.exit(0)
}

cleanPreviousArtifacts()

for (const platform of platforms) {
  const arches = archOption ? [archOption] : DEFAULT_ARCHES[platform]
  const workDir = join(root, 'dist', '.package', platform)
  rmSync(workDir, { recursive: true, force: true })
  mkdirSync(workDir, { recursive: true })
  for (const arch of arches) {
    if (!BINARIES[platform][arch]) {
      skipped.push(`${platform}/${arch}: not offered by the Neutralinojs framework`)
      continue
    }
    log(`packaging ${platform}/${arch}...`)
    if (platform === 'mac') packageMac(arch, workDir)
    if (platform === 'win') packageWin(arch, workDir)
    if (platform === 'linux') packageLinux(arch, workDir)
  }
  rmSync(workDir, { recursive: true, force: true })
}

if (skipped.length) {
  console.log('')
  for (const entry of skipped) log(`skipped ${entry}`)
}
console.log('')
for (const path of artifacts) log(`artifact: ${path}`)
log(`done — ${artifacts.length} artifact(s) in ${outputDir}`)
