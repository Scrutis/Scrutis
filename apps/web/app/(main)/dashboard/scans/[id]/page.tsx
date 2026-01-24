'use client'
import { useEffect, useState } from 'react'
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

  useEffect(() => {
    async function fetchScan() {
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
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchScan()
      // Poll for updates if scan is still in progress
      const interval = setInterval(() => {
        if (scan && (scan.status === 'pending' || scan.status === 'scanning')) {
          fetchScan()
        }
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [params.id, router, scan?.status])

  if (isLoading) {
    return (
      <main className="relative z-10">
        <div className="mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        </div>
      </main>
    )
  }

  if (!scan) {
    return (
      <main className="relative z-10">
        <div className="mx-auto px-2 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">Scan not found</p>
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
      <div className="mx-auto px-2 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Scan Details
          </h1>
        </div>

        <div className="grid gap-6">
          {/* Scan Overview */}
          <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-800/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900 dark:text-white">
                  Scan Information
                </CardTitle>
                {getStatusBadge()}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Type</p>
                  <div className="flex items-center gap-2">
                    {scan.type === 'file' ? (
                      <FileText className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Link2 className="w-4 h-4 text-gray-500" />
                    )}
                    <p className="font-medium text-gray-900 dark:text-white">
                      {scan.type.charAt(0).toUpperCase() + scan.type.slice(1)} Scan
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Target</p>
                  <p className="font-medium text-gray-900 dark:text-white break-all">
                    {scan.target}
                  </p>
                </div>
                {scan.fileHash && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">File Hash</p>
                    <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                      {scan.fileHash}
                    </p>
                  </div>
                )}
                {scan.fileSize && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">File Size</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatFileSize(scan.fileSize)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(scan.createdAt)}
                    </p>
                  </div>
                </div>
                {scan.completedAt && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Completed</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-900 dark:text-white">
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

          {/* Scan Results */}
          <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Scan Results
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Results from different scanning engines
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {scan.status === 'pending' || scan.status === 'scanning' 
                    ? 'Scan in progress... Results will appear here when complete.'
                    : 'No scan results available.'}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-600 dark:text-gray-300">Engine</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-300">Threat</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-300">Severity</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-300">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          {result.engine}
                        </TableCell>
                        <TableCell>
                          {result.detected ? (
                            <Badge variant="destructive">Detected</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-green-500">Clean</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-white">
                          {result.threatName || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {result.severity ? (
                            <Badge variant="outline">{result.severity}</Badge>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400">
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
