import { app, events, filesystem, init, os, window as neutralinoWindow } from '@neutralinojs/lib'
import type { AppInfo, MusicFile, TombolaApi } from '../env'
import type { TombolaSettings } from '../core/types'

const AUDIO_EXTENSIONS = ['mp3', 'm4a', 'aac', 'ogg', 'wav', 'flac', 'opus']
const SETTINGS_FILE = 'tombola-settings.json'
const BROWSER_SETTINGS_KEY = 'tombola-settings'
const CUSTOM_MUSIC_PREFIX = 'custom-music'
const QUIT_MENU_ID = 'quit'

/** True when the app runs inside the Neutralinojs framework. */
function isNeutralinoRuntime(): boolean {
  return typeof window.NL_PORT === 'number'
}

function dataPath(): string {
  return window.NL_DATAPATH
}

function fileNameOf(path: string): string {
  const normalized = path.replace(/\\/g, '/')
  return normalized.slice(normalized.lastIndexOf('/') + 1)
}

function extensionOf(path: string): string {
  const name = fileNameOf(path)
  const index = name.lastIndexOf('.')
  return index === -1 ? '' : name.slice(index)
}

function isAbsolutePath(path: string): boolean {
  return /^([a-zA-Z]:[\\/]|[\\/])/.test(path)
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

/**
 * Neutralino's `filesystem.createDirectory` fails with NE_FS_DIRCRER when the
 * directory already exists, so the app data path must be ensured best-effort.
 */
async function ensureDataDirectory(): Promise<void> {
  await ignoreFailure(() => filesystem.createDirectory(dataPath()))
}

async function ignoreFailure(task: () => Promise<unknown>): Promise<void> {
  try {
    await task()
  } catch {
    // The file may not exist — mirror Node's `force` behaviour.
  }
}

/**
 * Neutralinojs implementation of the renderer bridge. Bundled assets are read
 * from the framework's static file server, user files from the app data path.
 */
function createNeutralinoApi(): TombolaApi {
  const settingsPath = () => `${dataPath()}/${SETTINGS_FILE}`

  return {
    async loadSettings(): Promise<TombolaSettings | null> {
      try {
        const raw = await filesystem.readFile(settingsPath())
        return JSON.parse(raw) as TombolaSettings
      } catch {
        return null
      }
    },

    async saveSettings(settings: TombolaSettings): Promise<void> {
      await ensureDataDirectory()
      await filesystem.writeFile(settingsPath(), JSON.stringify(settings, null, 2))
    },

    async setFullscreen(enabled: boolean): Promise<boolean> {
      if (enabled) {
        await neutralinoWindow.setFullScreen()
      } else {
        await neutralinoWindow.exitFullScreen()
      }
      return neutralinoWindow.isFullScreen()
    },

    async isFullscreen(): Promise<boolean> {
      return neutralinoWindow.isFullScreen()
    },

    onFullscreenChange(callback: (enabled: boolean) => void): () => void {
      const enter = (): void => callback(true)
      const leave = (): void => callback(false)
      void events.on('windowFullScreenEnter', enter)
      void events.on('windowFullScreenExit', leave)
      return () => {
        void events.off('windowFullScreenEnter', enter)
        void events.off('windowFullScreenExit', leave)
      }
    },

    async getAppInfo(): Promise<AppInfo> {
      return {
        version: window.NL_APPVERSION,
        platform: window.NL_OS,
        userDataPath: dataPath()
      }
    },

    async savePdf(defaultName: string, data: Uint8Array): Promise<string | null> {
      const path = await os.showSaveDialog('PDF speichern', {
        defaultPath: defaultName,
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
      })
      if (!path) return null
      await filesystem.writeBinaryFile(path, toArrayBuffer(data))
      return path
    },

    async saveFile(
      defaultName: string,
      data: Uint8Array,
      filters?: { name: string; extensions: string[] }[]
    ): Promise<string | null> {
      const path = await os.showSaveDialog('Datei speichern', {
        defaultPath: defaultName,
        filters: filters ?? []
      })
      if (!path) return null
      await filesystem.writeBinaryFile(path, toArrayBuffer(data))
      return path
    },

    async readBinary(filePath: string): Promise<Uint8Array | null> {
      // Absolute paths point outside of the app bundle (custom music).
      if (isAbsolutePath(filePath)) {
        try {
          const data = await filesystem.readBinaryFile(filePath)
          return new Uint8Array(data)
        } catch {
          return null
        }
      }
      try {
        const response = await fetch(`/${filePath.replace(/^[/\\]+/, '')}`)
        if (!response.ok) return null
        return new Uint8Array(await response.arrayBuffer())
      } catch {
        return null
      }
    },

    async chooseMusic(): Promise<MusicFile | null> {
      const entries = await os.showOpenDialog('Musik auswählen', {
        filters: [{ name: 'Audio', extensions: AUDIO_EXTENSIONS }]
      })
      if (!entries || entries.length === 0) return null
      const source = entries[0] as string
      const destination = `${dataPath()}/${CUSTOM_MUSIC_PREFIX}${extensionOf(source)}`
      await ensureDataDirectory()
      await filesystem.copy(source, destination)
      const data = await filesystem.readBinaryFile(destination)
      return {
        path: destination,
        name: fileNameOf(source),
        data: new Uint8Array(data)
      }
    },

    async loadMusic(filePath: string): Promise<MusicFile | null> {
      try {
        const data = await filesystem.readBinaryFile(filePath)
        return { path: filePath, name: fileNameOf(filePath), data: new Uint8Array(data) }
      } catch {
        return null
      }
    },

    async clearMusic(): Promise<boolean> {
      for (const extension of AUDIO_EXTENSIONS) {
        await ignoreFailure(() =>
          filesystem.remove(`${dataPath()}/${CUSTOM_MUSIC_PREFIX}.${extension}`)
        )
      }
      return true
    },

    quit(): void {
      void terminateProcess()
    }
  }
}

/**
 * Terminates the app process via the framework's graceful shutdown, which
 * saves the window state and exits with code 0. `app.exit()` is safe on
 * macOS again: framework v6.10.0 fixed the pre-6.3 termination crash
 * (neutralinojs/neutralinojs#1469) by running the webview termination on
 * the main thread. The former macOS workaround, `app.killProcess`, must not
 * be used — it aborts itself with SIGINT, which surfaces as the non-zero
 * exit code 130 (seen as `neu: WARN ... stopped with error code 130`).
 */
async function terminateProcess(): Promise<void> {
  await app.exit()
}

/** Browser fallback so the UI also works with a plain `vite` dev server. */
function createBrowserApi(): TombolaApi {
  return {
    async loadSettings(): Promise<TombolaSettings | null> {
      try {
        const raw = window.localStorage.getItem(BROWSER_SETTINGS_KEY)
        return raw ? (JSON.parse(raw) as TombolaSettings) : null
      } catch {
        return null
      }
    },

    async saveSettings(settings: TombolaSettings): Promise<void> {
      try {
        window.localStorage.setItem(BROWSER_SETTINGS_KEY, JSON.stringify(settings))
      } catch {
        // Storage may be unavailable (private mode, quota).
      }
    },

    async setFullscreen(enabled: boolean): Promise<boolean> {
      try {
        if (enabled && !document.fullscreenElement) {
          await document.documentElement.requestFullscreen()
        } else if (!enabled && document.fullscreenElement) {
          await document.exitFullscreen()
        }
      } catch {
        // Fullscreen requests need a user gesture in the browser.
      }
      return document.fullscreenElement !== null
    },

    async isFullscreen(): Promise<boolean> {
      return document.fullscreenElement !== null
    },

    onFullscreenChange(callback: (enabled: boolean) => void): () => void {
      const handler = (): void => callback(document.fullscreenElement !== null)
      document.addEventListener('fullscreenchange', handler)
      return () => document.removeEventListener('fullscreenchange', handler)
    },

    async getAppInfo(): Promise<AppInfo> {
      return { version: import.meta.env.DEV ? 'dev' : 'web', platform: 'browser', userDataPath: '' }
    },

    async savePdf(defaultName: string, data: Uint8Array): Promise<string | null> {
      return downloadFile(defaultName, data, 'application/pdf')
    },

    async saveFile(defaultName: string, data: Uint8Array): Promise<string | null> {
      return downloadFile(defaultName, data, 'application/octet-stream')
    },

    async readBinary(filePath: string): Promise<Uint8Array | null> {
      if (isAbsolutePath(filePath)) return null
      try {
        const response = await fetch(`/${filePath.replace(/^[/\\]+/, '')}`)
        if (!response.ok) return null
        return new Uint8Array(await response.arrayBuffer())
      } catch {
        return null
      }
    },

    async chooseMusic(): Promise<MusicFile | null> {
      return pickAudioFile()
    },

    async loadMusic(): Promise<MusicFile | null> {
      // The browser cannot read back files choosen in a previous session.
      return null
    },

    async clearMusic(): Promise<boolean> {
      return true
    },

    quit(): void {
      window.close()
    }
  }
}

function downloadFile(name: string, data: Uint8Array, mime: string): string | null {
  const url = URL.createObjectURL(new Blob([toArrayBuffer(data)], { type: mime }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
  return name
}

function pickAudioFile(): Promise<MusicFile | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = AUDIO_EXTENSIONS.map((extension) => `.${extension}`).join(',')
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) {
        resolve(null)
        return
      }
      void file.arrayBuffer().then((buffer) => {
        resolve({ path: file.name, name: file.name, data: new Uint8Array(buffer) })
      })
    }
    input.oncancel = () => resolve(null)
    input.click()
  })
}

/**
 * Installs `window.tombola`. When the app runs inside Neutralinojs the native
 * bridge is used; otherwise a browser fallback keeps development working.
 */
export function installDesktopBridge(): void {
  if (isNeutralinoRuntime()) {
    window.tombola = createNeutralinoApi()
    init()
    registerExitHandlers()
    return
  }
  window.tombola = createBrowserApi()
}

/**
 * Wires the desktop quit paths: the window's close button, the native Quit
 * menu item and ⌘Q. Closing the button dispatches `windowClose` (because
 * `exitProcessOnClose` is disabled — otherwise the framework would crash on
 * the way out), and Cmd-Q is delivered either through the menu accelerator
 * created by `setupMainMenu` or through the keyboard fallback below.
 */
function registerExitHandlers(): void {
  void events.on('windowClose', () => {
    window.tombola.quit()
  })
  void events.on('mainMenuItemClicked', (event: CustomEvent) => {
    if (event.detail?.id === QUIT_MENU_ID) {
      window.tombola.quit()
    }
  })
  if (window.NL_OS === 'Darwin') {
    window.addEventListener('keydown', onQuitShortcut)
  }
}

function onQuitShortcut(event: KeyboardEvent): void {
  if (
    event.metaKey &&
    !event.shiftKey &&
    !event.altKey &&
    (event.key === 'q' || event.key === 'Q')
  ) {
    event.preventDefault()
    window.tombola.quit()
  }
}

/**
 * Installs the minimal application menu that exposes a Quit item (⌘Q on
 * macOS). The framework only creates this menu when asked, which is why
 * Cmd-Q has no handler by default. Labels come from the active UI locale.
 *
 * The native menu is limited to macOS on purpose: on Windows and Linux it
 * renders inside the window frame, and the framework's fullscreen mode
 * strips only the caption (`WS_CAPTION`/`WS_THICKFRAME`) — the attached
 * menu bar stays visible over the presentation. On those platforms the
 * window close button, Alt+F4 and the `windowClose` handler below already
 * provide quitting, and the app's own header UI covers the rest.
 */
export async function setupMainMenu(labels: { appName: string; quit: string }): Promise<void> {
  if (!isNeutralinoRuntime()) return
  if (window.NL_OS !== 'Darwin') return
  await neutralinoWindow.setMainMenu([
    {
      id: 'tombola',
      text: labels.appName,
      menuItems: [{ id: QUIT_MENU_ID, text: labels.quit, shortcut: 'q' }]
    }
  ])
}
