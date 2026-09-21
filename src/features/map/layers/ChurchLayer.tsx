import { motion } from 'framer-motion'
import type { LayerProps } from './types'

const CHURCH_PATH = 'M-8 8 v-9 l8 -7 l8 7 v9 z M-2 8 v-6 h4 v6 z M0 -8 v-5 M-3 -11 h6'

/** 서신서: 도시 옆에 세워지는 교회와 주제 라벨. 같은 도시는 세로로 쌓인다 */
export function ChurchLayer({ state, cities, isNew }: LayerProps) {
  const stack = new Map<string, number>()
  return (
    <g className="layer-church">
      {state.churches.map((ch) => {
        const c = cities.get(ch.at)
        if (!c) return null
        const n = stack.get(ch.at) ?? 0
        stack.set(ch.at, n + 1)
        return (
          <motion.g
            key={ch.book}
            data-testid="church"
            transform={`translate(${c.x + 28} ${c.y - 6 + n * 22})`}
            initial={isNew(`book:${ch.book}`) ? { opacity: 0, y: 12 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <path d={CHURCH_PATH} fill="none" stroke="var(--gold)" strokeWidth={1.8} strokeLinejoin="round" />
            <text x={14} y={4} fontSize={12} fill="var(--gold-soft)">
              {ch.label}
            </text>
          </motion.g>
        )
      })}
    </g>
  )
}
