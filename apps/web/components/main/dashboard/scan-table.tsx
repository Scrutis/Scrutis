"use client"

import { useEffect, useState } from "react";
import { Badge } from "@scrutis/ui/components/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@scrutis/ui/components/card"
import { Skeleton } from "@scrutis/ui/components/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@scrutis/ui/components/table"
import { Loader2, ShieldCheck, ShieldOff, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { CreateScan } from "../create-scan";

type Scan = {
  id: string;
  type: string;
  target: string;
  status: string;
  severity: string | null;
  result: string | null;
  createdAt: string;
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
}

const ScanStatus = ({ status, severity, result }: { status: string; severity: string | null; result: string | null }) => {
  if (status === "scanning" || status === "pending") {
    return (
      <Badge variant="outline" className="text-blue-500">
        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
        {status === "scanning" ? "Scanning" : "Pending"}
      </Badge>
    );
  }

  if (result === "infected" || result === "suspicious") {
    return (
      <Badge variant="destructive" className="text-xs">
        <ShieldOff className="mr-1 h-3.5 w-3.5" />
        {severity || "Threat"}
      </Badge>
    );
  }

  if (result === "clean") {
    return (
      <Badge variant="secondary" className="text-green-500">
        <ShieldCheck className="mr-1 h-3.5 w-3.5" />
        Clean
      </Badge>
    );
  }

  if (status === "failed") {
    return (
      <Badge variant="outline" className="text-red-500">
        Failed
      </Badge>
    );
  }

  return <Badge variant="outline">{status}</Badge>;
};

export function ScansTable() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchScans() {
      try {
        const response = await fetch('/api/scans');
        if (response.ok) {
          const data = await response.json();
          setScans(data.scans || []);
        }
      } catch (error) {
        console.error('Error fetching scans:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchScans();
    // Refresh every 5 seconds to get updated scan statuses
    const interval = setInterval(fetchScans, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleScanClick = (scanId: string) => {
    router.push(`/dashboard/scans/${scanId}`);
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/70 shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-slate-900 dark:text-white">
              Recent Scans
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              Loading your latest scans...
            </CardDescription>
          </div>
          <CreateScan />
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200/70 dark:border-slate-800/80">
                <TableHead className="text-slate-500 dark:text-slate-400">Type</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Target</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Status</TableHead>
                <TableHead className="text-right text-slate-500 dark:text-slate-400">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`} className="border-slate-100 dark:border-slate-800">
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/70 shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-slate-900 dark:text-white">
            Recent Scans
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-300">
            Track the latest file and URL scans.
          </CardDescription>
        </div>
        <CreateScan />
      </CardHeader>
      <CardContent>
        {scans.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-200/60 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/40 py-12 text-slate-500 dark:text-slate-400">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm dark:bg-slate-900/80 dark:text-slate-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="text-base font-medium text-slate-900 dark:text-white">
              No scans yet
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Start a file or URL scan to populate this table.
            </div>
            <CreateScan />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200/70 dark:border-slate-800/80">
                <TableHead className="text-slate-500 dark:text-slate-400">
                  Type
                </TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">
                  Target
                </TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">
                  Status
                </TableHead>
                <TableHead className="text-right text-slate-500 dark:text-slate-400">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scans.slice(0, 10).map((scanItem) => (
                <TableRow
                  key={scanItem.id}
                  className="cursor-pointer border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/40"
                  onClick={() => handleScanClick(scanItem.id)}
                >
                  <TableCell className="font-medium text-slate-900 dark:text-white">
                    {scanItem.type.charAt(0).toUpperCase() + scanItem.type.slice(1)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-300">
                      <span className="text-sm truncate max-w-[300px]">{scanItem.target}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ScanStatus
                      status={scanItem.status}
                      severity={scanItem.severity}
                      result={scanItem.result}
                    />
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-500 dark:text-slate-400">
                    {formatTimeAgo(new Date(scanItem.createdAt))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
