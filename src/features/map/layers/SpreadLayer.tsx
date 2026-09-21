import { motion } from 'framer-motion'
import type { LayerProps } from './types'

/** 사도행전: 도시 사이를 잇는 빛의 선 */
export function SpreadLayer({ state, cities, isNew }: LayerProps) {
  return (
    <g className="layer-spread">
      {state.spreads.map((s, i) => {
        if (s.from === s.to) return null
        const a = cities.get(s.from)
        const b = cities.get(s.to)
        if (!a || !b) return null
        return (
          <motion.line
            key={`${s.from}-${s.to}-${i}`}
            data-testid="spread-line"
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="var(--gold)"
            strokeWidth={2.5}
            strokeLinecap="round"
            filter="url(#glow)"
            initial={isNew(s.ref) ? { pathLength: 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: 0.9 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        )
      })}
    </g>
  )
}
