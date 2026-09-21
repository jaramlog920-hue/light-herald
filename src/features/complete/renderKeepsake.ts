import type { MapCity } from '../../content/types'
import type { MapState } from '../map/resolveMap'
import { getBook, parseRef } from '../../content/books'

export interface KeepsakeInput {
  bg: CanvasImageSource
  cities: MapCity[]
  state: MapState
  notes: Record<string, string>
  readChapters: Record<string, string>
  title: string
  cycleTitle: string
}

const W = 1536
const H = 1024
const FOOTER = 200

/** 완주 기념 지도를 canvas에 그린다. 반환값은 dataURL(PNG) */
export function renderKeepsake(canvas: HTMLCanvasElement, input: KeepsakeInput): string {
  canvas.width = W
  canvas.height = H + FOOTER
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#05070d'
  ctx.fillRect(0, 0, W, H + FOOTER)
  ctx.drawImage(input.bg, 0, 0, W, H)

  const byId = new Map(input.cities.map((c) => [c.id, c]))
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#e6b422'
  ctx.lineWidth = 3
  ctx.shadowColor = '#e6b422'
  ctx.shadowBlur = 12
  for (const s of input.state.spreads) {
    if (s.from === s.to) continue
    const a = byId.get(s.from)!
    const b = byId.get(s.to)!
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }
  ctx.shadowBlur = 0

  ctx.font = '15px system-ui, sans-serif'
  ctx.textAlign = 'center'
  for (const c of input.cities) {
    const lit = input.state.litCities.has(c.id)
    ctx.beginPath()
    ctx.arc(c.x, c.y, lit ? 7 : 3, 0, Math.PI * 2)
    ctx.fillStyle = lit ? '#ffe9a8' : '#3a3a48'
    ctx.fill()
    ctx.fillStyle = lit ? '#e8dcc0' : '#55556a'
    ctx.fillText(c.name, c.x, c.y - 14)
  }

  // 묵상: 도시 근처에 최대 12개, 나머지는 하단에
  ctx.textAlign = 'left'
  ctx.font = '13px system-ui, sans-serif'
  const noteEntries = Object.entries(input.notes).filter(([, t]) => t.trim())
  const placed = noteEntries.slice(0, 12)
  placed.forEach(([ref, text], i) => {
    const { bookId, chapter } = parseRef(ref)
    const x = 40 + (i % 3) * 500
    const y = 60 + Math.floor(i / 3) * 44
    ctx.fillStyle = 'rgba(5,7,13,0.75)'
    ctx.fillRect(x - 8, y - 16, 480, 36)
    ctx.fillStyle = '#e6b422'
    ctx.fillText(`${getBook(bookId).abbr} ${chapter}`, x, y)
    ctx.fillStyle = '#e8dcc0'
    ctx.fillText(truncate(text, 34), x + 60, y)
    ctx.fillStyle = '#8a8270'
    ctx.fillText(input.readChapters[ref]?.slice(0, 10) ?? '', x + 60, y + 14)
  })

  // 하단 문구
  ctx.textAlign = 'center'
  ctx.fillStyle = '#e6b422'
  ctx.font = 'bold 30px system-ui, sans-serif'
  ctx.fillText('복음은 예루살렘에서 시작되어, 당신의 오늘까지 왔습니다.', W / 2, H + 70)
  ctx.fillStyle = '#e8dcc0'
  ctx.font = '20px system-ui, sans-serif'
  const dates = Object.values(input.readChapters).sort()
  ctx.fillText(`${input.title} · ${input.cycleTitle} · ${dates[0]?.slice(0, 10)} ~ ${dates.at(-1)?.slice(0, 10)}`, W / 2, H + 115)
  ctx.fillStyle = '#8a8270'
  ctx.font = '16px system-ui, sans-serif'
  ctx.fillText(`읽은 장 ${Object.keys(input.readChapters).length} · 남긴 묵상 ${noteEntries.length}`, W / 2, H + 150)

  return canvas.toDataURL('image/png')
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}
