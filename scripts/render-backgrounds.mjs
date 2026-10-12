import { Resvg } from '@resvg/resvg-js'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SRC = '/tmp/tombola-bg'
const OUT = join(process.cwd(), 'src/public/themes')
const themes = ['midnight', 'christmas', 'autumn', 'ocean', 'neonarcade']

for (const theme of themes) {
  const svg = readFileSync(join(SRC, `${theme}.svg`), 'utf8')
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1920 },
    background: '#000000'
  })
  const png = resvg.render().asPng()
  const dir = join(OUT, theme)
  mkdirSync(dir, { recursive: true })
  const pngPath = join(dir, 'background.png')
  const jpgPath = join(dir, 'background.jpg')
  writeFileSync(pngPath, png)
  execFileSync('magick', [pngPath, '-quality', '86', jpgPath])
  console.log(`rendered ${theme} -> ${jpgPath}`)
}
