import { motion } from 'framer-motion'
import type { LayerProps } from './types'

/** 계시록 완독: 예루살렘에서 퍼져 나가는 빛의 파동 */
export function NewJerusalemLayer({ state, cities }: LayerProps) {
  if (!state.newJerusalem) return null
  const j = cities.get('jerusalem')
  if (!j) return null
  return (
    <motion.g data-testid="new-jerusalem" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={j.x}
          cy={j.y}
          r={60}
          fill="none"
          stroke="#fff4c2"
          strokeWidth={2}
          initial={{ r: 40, opacity: 0.8 }}
          animate={{ r: [40, 220], opacity: [0.8, 0] }}
          transition={{ repeat: Infinity, duration: 4, delay: i * 1.3 }}
        />
      ))}
      <text x={j.x} y={j.y - 60} textAnchor="middle" fontSize={22} fill="#fff4c2" filter="url(#glow)">
        새 예루살렘
      </text>
    </motion.g>
  )
}
