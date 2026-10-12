export interface TicketData {
  number: number
  title: string
  /** Localized label for the number, e.g. "Losnummer". */
  label: string
  index: number
  total: number
  /** Whether to show the ticket's index (e.g. "1/10") at the bottom right. */
  showIndex?: boolean
}

export interface TicketTemplate {
  id: string
  nameKey: string
  /** Width / height in CSS pixels (96 dpi). */
  width: number
  height: number
  render: (data: TicketData) => string
}

const WIDTH = 320
const HEIGHT = 170

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function frame(inner: string, background: string, extra = ''): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" rx="10" fill="${background}"/>
  ${extra}
  ${inner}
</svg>`
}

function counter(data: TicketData, x: number, y: number, color: string): string {
  if (data.showIndex === false) return ''
  return `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="${color}" text-anchor="end">${data.index}/${data.total}</text>`
}

export const TICKET_TEMPLATES: TicketTemplate[] = [
  {
    id: 'classic',
    nameKey: 'lose.templates.classic',
    width: WIDTH,
    height: HEIGHT,
    render: (d) =>
      frame(
        `<rect x="10" y="10" width="${WIDTH - 20}" height="${HEIGHT - 20}" rx="6" fill="none" stroke="#8b6b2e" stroke-width="1.5" stroke-dasharray="6 5"/>
         <text x="26" y="40" font-family="Georgia, serif" font-size="15" fill="#6b5220">${escapeXml(d.title)}</text>
         <text x="${WIDTH / 2}" y="58" font-family="Arial, Helvetica, sans-serif" font-size="11" letter-spacing="2" fill="#9a7d3e" text-anchor="middle">${escapeXml(d.label.toUpperCase())}</text>
         <text x="${WIDTH / 2}" y="130" font-family="Georgia, serif" font-weight="bold" font-size="64" fill="#4a3410" text-anchor="middle">${d.number}</text>
         ${counter(d, WIDTH - 26, HEIGHT - 26, '#9a7d3e')}`,
        '#fdf6e3',
        `<rect x="0.75" y="0.75" width="${WIDTH - 1.5}" height="${HEIGHT - 1.5}" rx="9" fill="none" stroke="#8b6b2e" stroke-width="1.5"/>`
      )
  },
  {
    id: 'minimal',
    nameKey: 'lose.templates.minimal',
    width: WIDTH,
    height: HEIGHT,
    render: (d) =>
      frame(
        `<rect x="0" y="${HEIGHT - 6}" width="${WIDTH}" height="6" fill="#111827"/>
         <text x="24" y="46" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#111827">${escapeXml(d.title)}</text>
         <text x="${WIDTH / 2}" y="62" font-family="Arial, Helvetica, sans-serif" font-size="11" letter-spacing="3" fill="#6b7280" text-anchor="middle">${escapeXml(d.label.toUpperCase())}</text>
         <text x="${WIDTH / 2}" y="140" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="72" fill="#111827" text-anchor="middle">${d.number}</text>
         ${counter(d, WIDTH - 24, HEIGHT - 24, '#9ca3af')}`,
        '#ffffff',
        `<rect x="0.75" y="0.75" width="${WIDTH - 1.5}" height="${HEIGHT - 1.5}" rx="9" fill="none" stroke="#e5e7eb" stroke-width="1.5"/>`
      )
  },
  {
    id: 'retro',
    nameKey: 'lose.templates.retro',
    width: WIDTH,
    height: HEIGHT,
    render: (d) => {
      const dots = Array.from({ length: 9 }, (_, i) => i)
        .map(
          (i) =>
            `<circle cx="66" cy="${28 + i * 14}" r="2.4" fill="#0f766e" opacity="0.5"/>`
        )
        .join('')
      return frame(
        `${dots}
         <rect x="84" y="16" width="${WIDTH - 100}" height="${HEIGHT - 32}" rx="8" fill="#fff7ed"/>
         <text x="100" y="52" font-family="Verdana, Arial, sans-serif" font-size="15" font-weight="700" fill="#0f766e">${escapeXml(d.title)}</text>
         <text x="202" y="68" font-family="Verdana, Arial, sans-serif" font-size="10" letter-spacing="2" fill="#b45309" text-anchor="middle">${escapeXml(d.label.toUpperCase())}</text>
         <text x="202" y="130" font-family="Verdana, Arial, sans-serif" font-weight="700" font-size="58" fill="#b45309" text-anchor="middle">${d.number}</text>
         ${counter(d, WIDTH - 24, HEIGHT - 24, '#0f766e')}`,
        '#0f766e'
      )
    }
  },
  {
    id: 'festive',
    nameKey: 'lose.templates.festive',
    width: WIDTH,
    height: HEIGHT,
    render: (d) =>
      frame(
        `<g stroke="#ffffff" stroke-width="1.6" opacity="0.7" stroke-linecap="round">
           <g transform="translate(276,38)"><line y1="-9" y2="9"/><line x1="-8" y1="-4.5" x2="8" y2="4.5"/><line x1="-8" y1="4.5" x2="8" y2="-4.5"/></g>
           <g transform="translate(40,132)"><line y1="-7" y2="7"/><line x1="-6" y1="-3.5" x2="6" y2="3.5"/><line x1="-6" y1="3.5" x2="6" y2="-3.5"/></g>
           <g transform="translate(292,130)"><line y1="-6" y2="6"/><line x1="-5" y1="-3" x2="5" y2="3"/><line x1="-5" y1="3" x2="5" y2="-3"/></g>
         </g>
         <rect x="12" y="12" width="${WIDTH - 24}" height="${HEIGHT - 24}" rx="6" fill="none" stroke="#f6d365" stroke-width="1.5"/>
         <text x="28" y="46" font-family="Georgia, serif" font-size="16" fill="#fff6d5">${escapeXml(d.title)}</text>
         <text x="${WIDTH / 2}" y="62" font-family="Arial, Helvetica, sans-serif" font-size="11" letter-spacing="2" fill="#f6d365" text-anchor="middle">${escapeXml(d.label.toUpperCase())}</text>
         <text x="${WIDTH / 2}" y="132" font-family="Georgia, serif" font-weight="bold" font-size="62" fill="#fff6d5" text-anchor="middle">${d.number}</text>
         ${counter(d, WIDTH - 28, HEIGHT - 26, '#f6d365')}`,
        '#7f1d1d'
      )
  },
  {
    id: 'elegant',
    nameKey: 'lose.templates.elegant',
    width: WIDTH,
    height: HEIGHT,
    render: (d) =>
      frame(
        `<rect x="14" y="14" width="${WIDTH - 28}" height="${HEIGHT - 28}" rx="4" fill="none" stroke="#d4af37" stroke-width="1"/>
         <text x="30" y="48" font-family="Georgia, serif" font-size="16" fill="#e9d8a6">${escapeXml(d.title)}</text>
         <text x="${WIDTH / 2}" y="64" font-family="Arial, Helvetica, sans-serif" font-size="11" letter-spacing="3" fill="#d4af37" text-anchor="middle">${escapeXml(d.label.toUpperCase())}</text>
         <text x="${WIDTH / 2}" y="136" font-family="Georgia, serif" font-weight="bold" font-size="66" fill="#d4af37" text-anchor="middle">${d.number}</text>
         ${counter(d, WIDTH - 30, HEIGHT - 28, '#d4af37')}`,
        '#111827'
      )
  },
  {
    id: 'ocean',
    nameKey: 'lose.templates.ocean',
    width: WIDTH,
    height: HEIGHT,
    render: (d) =>
      frame(
        `<path d="M0,${HEIGHT - 34} C${WIDTH * 0.25},${HEIGHT - 54} ${WIDTH * 0.5},${HEIGHT - 14} ${WIDTH * 0.75},${HEIGHT - 34} S${WIDTH},${HEIGHT - 34} ${WIDTH},${HEIGHT - 34} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z" fill="#0ea5e9" opacity="0.35"/>
         <path d="M0,${HEIGHT - 20} C${WIDTH * 0.25},${HEIGHT - 40} ${WIDTH * 0.5},${HEIGHT} ${WIDTH * 0.75},${HEIGHT - 20} S${WIDTH},${HEIGHT - 20} ${WIDTH},${HEIGHT - 20} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z" fill="#0284c7" opacity="0.55"/>
         <text x="26" y="46" font-family="'Trebuchet MS', Arial, sans-serif" font-size="17" font-weight="700" fill="#075985">${escapeXml(d.title)}</text>
         <text x="${WIDTH / 2}" y="62" font-family="Arial, Helvetica, sans-serif" font-size="11" letter-spacing="3" fill="#0ea5e9" text-anchor="middle">${escapeXml(d.label.toUpperCase())}</text>
         <text x="${WIDTH / 2}" y="132" font-family="'Trebuchet MS', Arial, sans-serif" font-weight="700" font-size="64" fill="#0369a1" text-anchor="middle">${d.number}</text>
         ${counter(d, WIDTH - 26, HEIGHT - 26, '#0369a1')}`,
        '#eff6ff',
        `<rect x="0.75" y="0.75" width="${WIDTH - 1.5}" height="${HEIGHT - 1.5}" rx="9" fill="none" stroke="#7dd3fc" stroke-width="1.5"/>`
      )
  },
  {
    id: 'kids',
    nameKey: 'lose.templates.kids',
    width: WIDTH,
    height: HEIGHT,
    render: (d) => {
      const dots = [
        ['#f87171', 30, 30],
        ['#fbbf24', 290, 34],
        ['#34d399', 288, 138],
        ['#60a5fa', 34, 140]
      ]
        .map(([c, x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${c}" opacity="0.85"/>`)
        .join('')
      return frame(
        `${dots}
         <text x="26" y="48" font-family="'Comic Sans MS', 'Trebuchet MS', sans-serif" font-size="18" font-weight="700" fill="#7c3aed">${escapeXml(d.title)}</text>
         <text x="${WIDTH / 2}" y="64" font-family="Arial, Helvetica, sans-serif" font-size="11" letter-spacing="2" fill="#db2777" text-anchor="middle">${escapeXml(d.label.toUpperCase())}</text>
         <text x="${WIDTH / 2}" y="134" font-family="'Comic Sans MS', 'Trebuchet MS', sans-serif" font-weight="700" font-size="64" fill="#7c3aed" text-anchor="middle">${d.number}</text>
         ${counter(d, WIDTH - 26, HEIGHT - 26, '#db2777')}`,
        '#fef9ff',
        `<rect x="6" y="6" width="${WIDTH - 12}" height="${HEIGHT - 12}" rx="14" fill="none" stroke="#c4b5fd" stroke-width="2.5" stroke-dasharray="2 6" stroke-linecap="round"/>`
      )
    }
  },
  {
    id: 'ticket',
    nameKey: 'lose.templates.ticket',
    width: WIDTH,
    height: HEIGHT,
    render: (d) => {
      const notches = Array.from({ length: 7 }, (_, i) => i)
        .map((i) => `<circle cx="98" cy="${18 + i * 23}" r="4.5" fill="#f59e0b"/>`)
        .join('')
      return frame(
        `<rect x="0" y="0" width="98" height="${HEIGHT}" fill="#fbbf24"/>
         <text x="49" y="${HEIGHT / 2}" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" letter-spacing="4" fill="#7c2d12" text-anchor="middle" transform="rotate(-90 49 ${HEIGHT / 2})">${escapeXml(d.label.toUpperCase())}</text>
         ${notches}
         <text x="209" y="50" font-family="'Arial Black', Arial, sans-serif" font-size="17" font-weight="800" fill="#7c2d12" text-anchor="middle">${escapeXml(d.title)}</text>
         <text x="209" y="142" font-family="'Arial Black', Arial, sans-serif" font-weight="800" font-size="66" fill="#b45309" text-anchor="middle">${d.number}</text>
         ${counter(d, WIDTH - 20, HEIGHT - 22, '#92400e')}`,
        '#fffbeb',
        `<rect x="0.75" y="0.75" width="${WIDTH - 1.5}" height="${HEIGHT - 1.5}" rx="9" fill="none" stroke="#f59e0b" stroke-width="1.5"/>`
      )
    }
  },
  {
    id: 'neon',
    nameKey: 'lose.templates.neon',
    width: WIDTH,
    height: HEIGHT,
    render: (d) =>
      frame(
        `<rect x="12" y="12" width="${WIDTH - 24}" height="${HEIGHT - 24}" rx="8" fill="none" stroke="#22d3ee" stroke-width="1.5" opacity="0.9"/>
         <rect x="16" y="16" width="${WIDTH - 32}" height="${HEIGHT - 32}" rx="6" fill="none" stroke="#e879f9" stroke-width="0.8" opacity="0.7"/>
         <text x="30" y="48" font-family="'Trebuchet MS', Arial, sans-serif" font-size="16" font-weight="700" fill="#22d3ee">${escapeXml(d.title)}</text>
         <text x="${WIDTH / 2}" y="64" font-family="Arial, Helvetica, sans-serif" font-size="11" letter-spacing="4" fill="#e879f9" text-anchor="middle">${escapeXml(d.label.toUpperCase())}</text>
         <text x="${WIDTH / 2}" y="136" font-family="'Trebuchet MS', Arial, sans-serif" font-weight="700" font-size="66" fill="#f0abfc" text-anchor="middle">${d.number}</text>
         ${counter(d, WIDTH - 30, HEIGHT - 28, '#22d3ee')}`,
        '#0b1020'
      )
  }
]

export function getTemplate(id: string): TicketTemplate {
  return TICKET_TEMPLATES.find((template) => template.id === id) ?? (TICKET_TEMPLATES[0] as TicketTemplate)
}
