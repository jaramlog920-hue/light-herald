import { motion } from 'framer-motion'
import type { LayerProps } from './types'

/** 모든 도시 점과 이름. 켜진 도시는 금빛으로 맥동한다 */
export function CityLayer({ state, cities, onSelect }: LayerProps & { onSelect?: (id: string) => void }) {
  return (
    <g className="layer-city">
      {[...cities.values()].map((c) => {
        const lit = state.litCities.has(c.id)
        return (
          <g
            key={c.id}
            data-testid={`city-${c.id}`}
            data-lit={lit}
            transform={`translate(${c.x} ${c.y})`}
            onClick={() => onSelect?.(c.id)}
            style={{ cursor: 'pointer' }}
          >
            <circle r={30} fill="transparent" />
            {lit && (
              <motion.circle
                r={22}
                fill="var(--gold)"
                opacity={0.25}
                filter="url(#glow)"
                initial={{ r: 18, opacity: 0.2 }}
                animate={{ r: [18, 26, 18], opacity: [0.2, 0.35, 0.2] }}
                transition={{ repeat: Infinity, duration: 3 }}
              />
            )}
            <circle r={lit ? 6 : 3.5} fill={lit ? 'var(--gold)' : '#3a3a48'} />
            <text
              x={c.label === 'left' ? -12 : c.label === 'right' ? 12 : 0}
              y={c.label === 'bottom' ? 24 : c.label === 'left' || c.label === 'right' ? 5 : -14}
              textAnchor={c.label === 'left' ? 'end' : c.label === 'right' ? 'start' : 'middle'}
              fontSize={14}
              fill={lit ? 'var(--fg)' : '#55556a'}
            >
              {c.name}
            </text>
          </g>
        )
      })}
    </g>
  )
}
