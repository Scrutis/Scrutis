"use client"

import { useEffect, useState } from "react";
import { Badge } from "@scrutis/ui/components/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@scrutis/ui/components/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@scrutis/ui/components/table"
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { useRouter } from "next/navigation";

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
      <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-800/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
      <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Recent Scans
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            A list of your most recent scans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scans.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No scans yet. Create your first scan to get started!
            </div>
          ) : (
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
                {scans.slice(0, 10).map((scanItem) => (
                  <TableRow 
                    key={scanItem.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => handleScanClick(scanItem.id)}
                  >
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {scanItem.type.charAt(0).toUpperCase() + scanItem.type.slice(1)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
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
                    <TableCell className="text-right text-muted-foreground">
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
