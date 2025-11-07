"use client"

import { Badge } from "@scrutis/ui/components/badge";
import { Button } from "@scrutis/ui/components/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@scrutis/ui/components/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@scrutis/ui/components/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@scrutis/ui/components/table"
import { ExternalLink, GitBranch, Loader2, MoreHorizontal, ShieldCheck, ShieldOff } from "lucide-react";

const recentScans = [
  {
    id: "scan_1f23",
    type: "File",
    target: "prod-exec.exe",
    status: "Infected",
    severity: "High",
    date: "2m ago",
  },
  {
    id: "scan_0a9b",
    type: "URL",
    target: "http://malicious-site.xyz",
    status: "Infected",
    severity: "High",
    date: "15m ago",
  },
  {
    id: "scan_c3d4",
    type: "File",
    target: "q4_report_final.pdf",
    status: "Clean",
    severity: "None",
    date: "45m ago",
  },
  {
    id: "scan_e5f6",
    type: "File",
    target: "node_modules.zip",
    status: "Scanning",
    severity: "...",
    date: "1h ago",
  },
  {
    id: "scan_g7h8",
    type: "URL",
    target: "http://google.com",
    status: "Clean",
    severity: "None",
    date: "2h ago",
  },
];

const ScanStatus = ({ status, severity }: { status: string; severity: string }) => {
  switch (status) {
    case "Infected":
      return (
        <Badge variant="destructive" className="text-xs">
          <ShieldOff className="mr-1 h-3.5 w-3.5" />
          {severity}
        </Badge>
      );
    case "Clean":
      return (
        <Badge variant="secondary" className="text-green-500">
          <ShieldCheck className="mr-1 h-3.5 w-3.5" />
          Clean
        </Badge>
      );
    case "Scanning":
      return (
        <Badge variant="outline" className="text-blue-500">
          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          Scanning
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const deployments = [
  {
    id: "dep-001",
    project: "E-commerce Frontend",
    branch: "main",
    status: "success",
    environment: "production",
    deployedAt: "2 hours ago",
    duration: "2m 34s",
    url: "https://ecommerce.example.com",
  },
  {
    id: "dep-002",
    project: "API Gateway",
    branch: "develop",
    status: "building",
    environment: "staging",
    deployedAt: "5 minutes ago",
    duration: "1m 12s",
    url: "https://api-staging.example.com",
  },
  {
    id: "dep-003",
    project: "Admin Dashboard",
    branch: "feature/auth",
    status: "failed",
    environment: "development",
    deployedAt: "1 day ago",
    duration: "45s",
    url: "https://admin-dev.example.com",
  },
  {
    id: "dep-004",
    project: "Mobile App Backend",
    branch: "main",
    status: "success",
    environment: "production",
    deployedAt: "3 days ago",
    duration: "3m 21s",
    url: "https://mobile-api.example.com",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "success":
      return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
    case "building":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
    case "failed":
      return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
  }
}

const getEnvironmentColor = (environment: string) => {
  switch (environment) {
    case "production":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
    case "staging":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
    case "development":
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
  }
}


export function ScansTable() {
  return (
      <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Recent Scans
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            A list of your 5 most recent scans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-600 dark:text-gray-300">
                  Type
                </TableHead>
                <TableHead className="text-gray-600 dark:text-gray-300">
                  Target
                </TableHead>
                <TableHead className="text-gray-600 dark:text-gray-300">
                  Status
                </TableHead>
                <TableHead className="text-gray-600 dark:text-gray-300 text-right">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentScans.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell className="font-medium text-gray-900 dark:text-white">
                    {scan.type}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                      <span className="text-sm">{scan.target}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ScanStatus status={scan.status} severity={scan.severity} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {scan.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
  );
}
