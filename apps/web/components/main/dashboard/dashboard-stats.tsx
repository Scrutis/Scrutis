"use client"

import { useEffect, useState } from "react";
import { Badge } from "@scrutis/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@scrutis/ui/components/card"
import { TrendingUp, TrendingDown, Zap, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

type Stats = {
  totalScans: number;
  cleanScans: number;
  infectedScans: number;
  queuedScans: number;
  infectionRate: string;
};

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
    // Refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200/50 dark:border-primary"
          >
            <CardContent className="p-6">
              <div className="h-20 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Total scans",
      value: stats.totalScans.toLocaleString(),
      change: "",
      trend: "up" as const,
      icon: Zap,
      description: "all time",
    },
    {
      title: "Clean",
      value: stats.cleanScans.toLocaleString(),
      change: "",
      trend: "up" as const,
      icon: CheckCircle2,
      description: "clean scans",
    },
    {
      title: "Infection Rate",
      value: stats.infectionRate,
      change: "",
      trend: stats.infectedScans > 0 ? "up" as const : "down" as const,
      icon: AlertCircle,
      description: "threat detection rate",
    },
    {
      title: "Queued Scans",
      value: stats.queuedScans.toLocaleString(),
      change: "",
      trend: "up" as const,
      icon: Loader2,
      description: "pending or scanning",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => (
        <Card
          key={stat.title}
          className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200/50 dark:border-primary"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</CardTitle>
            {stat.icon == Loader2 ? (
              <Loader2 className="h-4 w-4 text-gray-500 dark:text-gray-400 animate-spin" />
            ) : (
              <stat.icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
          </CardHeader>
          <CardContent>
            <div className="pb-2 text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              {stat.change && (
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
              )}
              <span>{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
