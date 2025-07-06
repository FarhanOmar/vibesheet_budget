import React from 'react'
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'

const defaultColors = [
  '#4dc9f6',
  '#f67019',
  '#f53794',
  '#537bc4',
  '#acc236',
  '#166a8f',
  '#00a950',
  '#58595b',
  '#8549ba',
]

const PieChartComponent: React.FC<PieChartProps> = ({
  data,
  width = '100%',
  height = 300,
  ariaLabel = 'Pie chart',
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="pie-chart__no-data"
        role="status"
        aria-live="polite"
      >
        No data to display
      </div>
    )
  }

  return (
    <div className="pie-chart" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width={width} height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="80%"
            label
          >
            {data.map((entry, index) => {
              const key = entry.id ?? entry.name ?? `cell-${index}`
              const fill =
                entry.color || defaultColors[index % defaultColors.length]
              return <Cell key={key} fill={fill} />
            })}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}

function areEqual(
  prevProps: Readonly<PieChartProps>,
  nextProps: Readonly<PieChartProps>
): boolean {
  if (
    prevProps.width !== nextProps.width ||
    prevProps.height !== nextProps.height ||
    prevProps.ariaLabel !== nextProps.ariaLabel
  ) {
    return false
  }
  const prevData = prevProps.data
  const nextData = nextProps.data
  if (prevData === nextData) {
    return true
  }
  if (!prevData || !nextData || prevData.length !== nextData.length) {
    return false
  }
  for (let i = 0; i < prevData.length; i++) {
    const a = prevData[i]
    const b = nextData[i]
    if (
      a.id !== b.id ||
      a.name !== b.name ||
      a.value !== b.value ||
      a.color !== b.color
    ) {
      return false
    }
  }
  return true
}

export default React.memo(PieChartComponent, areEqual)