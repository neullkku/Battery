"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface DefectChartProps {
  probability: number
}

export default function DefectChart({ probability }: DefectChartProps) {
  const data = [
    { name: "불량 위험", value: probability },
    { name: "품질", value: 100 - probability },
  ]

  const getColor = (prob: number) => {
    if (prob < 30) return "#10b981" // 녹색
    if (prob < 60) return "#f59e0b" // 노란색
    return "#ef4444" // 빨간색
  }

  const COLORS = [getColor(probability), "#e5e7eb"]

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">{probability.toFixed(1)}%</div>
          <div className="text-xs text-slate-600">불량 위험도</div>
        </div>
      </div>
    </div>
  )
}
