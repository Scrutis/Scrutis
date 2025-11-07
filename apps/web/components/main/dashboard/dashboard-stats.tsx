"use client"

import { Badge } from "@scrutis/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@scrutis/ui/components/card"
import { TrendingUp, TrendingDown, Zap, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

const stats = [
  {
    title: "Total scans",
    value: "1,234",
    change: "+12%",
    trend: "up",
    icon: Zap,
    description: "from last month",
  },
  {
    title: "Clean",
    value: "23",
    change: "+3",
    trend: "up",
    icon: CheckCircle2,
    description: "new this week",
  },
  {
    title: "Infected",
    value: "99.2%",
    change: "+0.3%",
    trend: "up",
    icon: AlertCircle,
    description: "last 30 days",
  },
  {
    title: "Queued Scans",
    value: "8",
    change: "+2",
    trend: "up",
    icon: Loader2,
    description: "active users",
  },
]

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200/50 dark:border-primary"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="pb-2 text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <Badge
                variant="secondary"
                className={`flex items-center space-x-1 ${
                  stat.trend === "up"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {stat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{stat.change}</span>
              </Badge>
              <span>{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
