'use client'
import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@scrutis/ui/components/card"
import { Badge } from "@scrutis/ui/components/badge"
import { Button } from "@scrutis/ui/components/button"
import { Loader2, ShieldCheck, ShieldOff, ArrowLeft, Calendar, FileText, Link2, AlertTriangle } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@scrutis/ui/components/table"

type Scan = {
  id: string;
  type: string;
  target: string;
  status: string;
  severity: string | null;
  result: string | null;
  fileHash: string | null;
  fileSize: number | null;
  metadata: any;
  errorMessage: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

type ScanResult = {
  id: string;
  scanId: string;
  engine: string;
  detected: boolean;
  threatName: string | null;
  severity: string | null;
  details: any;
  createdAt: string;
}

export default function ScanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [scan, setScan] = useState<Scan | null>(null)
  const [results, setResults] = useState<ScanResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchScan = useCallback(async (options?: { showLoading?: boolean; showRefresh?: boolean }) => {
    const { showLoading = false, showRefresh = false } = options || {};
    if (showLoading) setIsLoading(true);
    if (showRefresh) setIsRefreshing(true);

    try {
      const response = await fetch(`/api/scans/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setScan(data.scan)
        setResults(data.results || [])
      } else if (response.status === 404) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching scan:', error)
    } finally {
      if (showLoading) setIsLoading(false);
      if (showRefresh) setIsRefreshing(false);
    }
  }, [params.id, router])

  useEffect(() => {
    if (params.id) {
      fetchScan({ showLoading: true })
      // Poll for updates if scan is still in progress
      const interval = setInterval(() => {
        if (scan && (scan.status === 'pending' || scan.status === 'scanning')) {
          fetchScan()
        }
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [params.id, fetchScan, scan?.status])

  if (isLoading) {
    return (
      <main className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          </div>
        </div>
      </main>
    )
  }

  if (!scan) {
    return (
      <main className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Card className="border border-slate-200/60 bg-slate-50/80 dark:border-slate-800/70 dark:bg-slate-900/50">
            <CardContent className="p-6">
              <p className="text-center text-slate-500">Scan not found</p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const getStatusBadge = () => {
    if (scan.status === 'scanning' || scan.status === 'pending') {
      return (
        <Badge variant="outline" className="text-blue-500">
          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          {scan.status === 'scanning' ? 'Scanning' : 'Pending'}
        </Badge>
      )
    }

    if (scan.result === 'infected' || scan.result === 'suspicious') {
      return (
        <Badge variant="destructive">
          <ShieldOff className="mr-1 h-3.5 w-3.5" />
          {scan.severity || 'Threat Detected'}
        </Badge>
      )
    }

    if (scan.result === 'clean') {
      return (
        <Badge variant="secondary" className="text-green-500">
          <ShieldCheck className="mr-1 h-3.5 w-3.5" />
          Clean
        </Badge>
      )
    }

    if (scan.status === 'failed') {
      return (
        <Badge variant="outline" className="text-red-500">
          <AlertTriangle className="mr-1 h-3.5 w-3.5" />
          Failed
        </Badge>
      )
    }

    return <Badge variant="outline">{scan.status}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <main className="relative z-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200/70 pb-6 dark:border-slate-800/80">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="w-fit text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
                Scan Details
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Review scan status, metadata, and engine results.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchScan({ showRefresh: true })}
                disabled={isRefreshing}
                className="border-slate-200/70 bg-white text-slate-900 shadow-sm hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-900/60 dark:text-white"
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Refreshing
                  </>
                ) : (
                  'Refresh now'
                )}
              </Button>
              {getStatusBadge()}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="border border-slate-200/60 bg-slate-50/80 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">
                Scan Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(scan.status === 'pending' || scan.status === 'scanning') && (
                <div className="flex flex-col gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-200 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>
                      Scan in progress. We will keep checking for updates.
                    </span>
                  </div>
                  <span className="text-xs text-blue-700/80 dark:text-blue-200/80">
                    Last updated {formatDate(scan.updatedAt)}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200/60 bg-white/70 p-4 dark:border-slate-800/70 dark:bg-slate-900/40">
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Type</p>
                  <div className="flex items-center gap-2">
                    {scan.type === 'file' ? (
                      <FileText className="w-4 h-4 text-slate-500" />
                    ) : (
                      <Link2 className="w-4 h-4 text-slate-500" />
                    )}
                    <p className="font-medium text-slate-900 dark:text-white">
                      {scan.type.charAt(0).toUpperCase() + scan.type.slice(1)} Scan
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200/60 bg-white/70 p-4 dark:border-slate-800/70 dark:bg-slate-900/40">
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Target</p>
                  <p className="font-medium text-slate-900 dark:text-white break-all">
                    {scan.target}
                  </p>
                </div>
                {scan.fileHash && (
                  <div className="rounded-lg border border-slate-200/60 bg-white/70 p-4 dark:border-slate-800/70 dark:bg-slate-900/40">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">File Hash</p>
                    <p className="font-mono text-xs text-slate-900 dark:text-white break-all">
                      {scan.fileHash}
                    </p>
                  </div>
                )}
                {scan.fileSize && (
                  <div className="rounded-lg border border-slate-200/60 bg-white/70 p-4 dark:border-slate-800/70 dark:bg-slate-900/40">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">File Size</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {formatFileSize(scan.fileSize)}
                    </p>
                  </div>
                )}
                <div className="rounded-lg border border-slate-200/60 bg-white/70 p-4 dark:border-slate-800/70 dark:bg-slate-900/40">
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Created</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <p className="text-sm text-slate-900 dark:text-white">
                      {formatDate(scan.createdAt)}
                    </p>
                  </div>
                </div>
                {scan.completedAt && (
                  <div className="rounded-lg border border-slate-200/60 bg-white/70 p-4 dark:border-slate-800/70 dark:bg-slate-900/40">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Completed</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <p className="text-sm text-slate-900 dark:text-white">
                        {formatDate(scan.completedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {scan.errorMessage && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>Error:</strong> {scan.errorMessage}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-200/60 bg-slate-50/80 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">
                Scan Results
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Results from different scanning engines
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  {scan.status === 'pending' || scan.status === 'scanning'
                    ? 'Scan in progress... Results will appear here when complete.'
                    : 'No scan results available.'}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200/70 dark:border-slate-800/80">
                      <TableHead className="text-slate-500 dark:text-slate-400">Engine</TableHead>
                      <TableHead className="text-slate-500 dark:text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-500 dark:text-slate-400">Threat</TableHead>
                      <TableHead className="text-slate-500 dark:text-slate-400">Severity</TableHead>
                      <TableHead className="text-slate-500 dark:text-slate-400">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id} className="border-slate-100 dark:border-slate-800">
                        <TableCell className="font-medium text-slate-900 dark:text-white">
                          {result.engine}
                        </TableCell>
                        <TableCell>
                          {result.detected ? (
                            <Badge variant="destructive">Detected</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-green-500">Clean</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-900 dark:text-white">
                          {result.threatName || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {result.severity ? (
                            <Badge variant="outline">{result.severity}</Badge>
                          ) : (
                            <span className="text-slate-500">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(result.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
