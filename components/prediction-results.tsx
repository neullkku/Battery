"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface PredictionResultsProps {
  results: {
    defectRate: number
    avgParticleSize: number
    conductivity: number
    temperature: number
    humidity: number
  }
}

export default function PredictionResults({ results }: PredictionResultsProps) {
  const metrics = [
    {
      title: "불량률",
      value: `${results.defectRate.toFixed(1)}%`,
      status: results.defectRate < 5 ? "good" : results.defectRate < 10 ? "warning" : "danger",
      trend: "down",
    },
    {
      title: "입자 크기",
      value: `${results.avgParticleSize.toFixed(0)} nm`,
      status: Math.abs(results.avgParticleSize - 125) < 10 ? "good" : "warning",
      trend: "stable",
    },
    {
      title: "전도도",
      value: `${results.conductivity.toFixed(1)} S/m`,
      status: results.conductivity > 85 ? "good" : results.conductivity > 75 ? "warning" : "danger",
      trend: "up",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-100 text-green-800 border-green-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "danger":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center justify-between">
              {metric.title}
              {getTrendIcon(metric.trend)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
              <Badge className={getStatusColor(metric.status)}>{metric.status}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
