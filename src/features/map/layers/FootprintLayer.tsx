import { motion } from 'framer-motion'
import type { LayerProps } from './types'

/** 복음서: 도시 주위에 원형으로 찍히는 발자국 */
export function FootprintLayer({ state, cities, isNew }: LayerProps) {
  const byCity = new Map<string, string[]>()
  for (const f of state.footprints) byCity.set(f.at, [...(byCity.get(f.at) ?? []), f.ref])
  return (
    <g className="layer-footprint">
      {[...byCity].flatMap(([cityId, refs]) => {
        const c = cities.get(cityId)
        if (!c) return []
        return refs.map((ref, i) => {
          const ang = (i / Math.max(refs.length, 8)) * Math.PI * 2 - Math.PI / 2
          return (
            <motion.circle
              key={ref}
              data-testid="footprint"
              cx={c.x + Math.cos(ang) * 34}
              cy={c.y + Math.sin(ang) * 34}
              r={3}
              fill="var(--gold-soft)"
              initial={isNew(ref) ? { scale: 0, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 0.9 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            />
          )
        })
      })}
    </g>
  )
}
