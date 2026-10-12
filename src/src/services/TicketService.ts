import { PDFDocument } from 'pdf-lib'
import type { TicketData, TicketTemplate } from '../lose/templates'

const A4 = { width: 595.28, height: 841.89 }
const MARGIN = 28
const GAP = 12
const PX_TO_PT = 72 / 96
const MAX_TICKETS = 1000

export interface TicketExportOptions {
  numbers: number[]
  title: string
  label: string
  template: TicketTemplate
  /** Raster scale for the embedded bitmap (higher = sharper + larger file). */
  scale?: number
  /** Whether to show the ticket's index (e.g. "1/10") at the bottom right. */
  showIndex?: boolean
}

export interface TicketLayout {
  columns: number
  rows: number
  perPage: number
  pages: number
}

/**
 * Generates the printable raffle tickets ("Lose"). Each ticket is rasterised
 * from its SVG template in the browser (no native dependencies) and assembled
 * into an A4 PDF with `pdf-lib`, laid out in a grid to save paper.
 */
export class TicketService {
  layout(template: TicketTemplate, count: number): TicketLayout {
    const ticketW = template.width * PX_TO_PT
    const ticketH = template.height * PX_TO_PT
    const columns = Math.max(1, Math.floor((A4.width - 2 * MARGIN + GAP) / (ticketW + GAP)))
    const rows = Math.max(1, Math.floor((A4.height - 2 * MARGIN + GAP) / (ticketH + GAP)))
    const perPage = columns * rows
    return { columns, rows, perPage, pages: Math.max(1, Math.ceil(count / perPage)) }
  }

  async buildPdf(options: TicketExportOptions): Promise<Uint8Array> {
    const { numbers, template } = options
    const tickets = numbers.slice(0, MAX_TICKETS)
    const ticketW = template.width * PX_TO_PT
    const ticketH = template.height * PX_TO_PT
    const { columns, perPage } = this.layout(template, tickets.length)
    const scale = options.scale ?? 3

    const pdf = await PDFDocument.create()
    let page = pdf.addPage([A4.width, A4.height])

    for (let i = 0; i < tickets.length; i++) {
      if (i > 0 && i % perPage === 0) {
        page = pdf.addPage([A4.width, A4.height])
      }
      const slot = i % perPage
      const col = slot % columns
      const row = Math.floor(slot / columns)
      const x = MARGIN + col * (ticketW + GAP)
      const y = A4.height - MARGIN - ticketH - row * (ticketH + GAP)

      const data: TicketData = {
        number: tickets[i] as number,
        title: options.title,
        label: options.label,
        index: i + 1,
        total: tickets.length,
        showIndex: options.showIndex
      }
      const png = await this.renderTicket(template, data, scale)
      const image = await pdf.embedPng(png)
      page.drawImage(image, { x, y, width: ticketW, height: ticketH })
    }

    return pdf.save()
  }

  /** Render one ticket template to PNG bytes using a canvas. */
  private async renderTicket(
    template: TicketTemplate,
    data: TicketData,
    scale: number
  ): Promise<Uint8Array> {
    const svg = template.render(data)
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    try {
      const image = await loadImage(url)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(template.width * scale)
      canvas.height = Math.round(template.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas 2D context unavailable')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      return dataUrlToBytes(canvas.toDataURL('image/png'))
    } finally {
      URL.revokeObjectURL(url)
    }
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to render ticket template'))
    image.src = url
  })
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] ?? ''
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/** Build a list of ticket numbers for an inclusive range. */
export function rangeNumbers(from: number, to: number, step = 1): number[] {
  const safeStep = Math.max(1, Math.floor(step))
  const start = Math.min(from, to)
  const end = Math.max(from, to)
  const result: number[] = []
  for (let value = start; value <= end; value += safeStep) result.push(value)
  return result
}
