 'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@scrutis/ui/components/card'
import { Button } from '@scrutis/ui/components/button'
import { Input } from '@scrutis/ui/components/input'
import { Label } from '@scrutis/ui/components/label'
import { ArrowLeft, Loader2, Upload } from 'lucide-react'

type Project = {
  id: string;
  name: string;
  description: string | null;
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export default function FileScanPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProjects() {
      setIsLoadingProjects(true)
      try {
        const response = await fetch('/api/projects')
        if (response.ok) {
          const data = await response.json()
          setProjects(data.projects || [])
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setIsLoadingProjects(false)
      }
    }

    fetchProjects()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > MAX_FILE_SIZE) {
        setFileError(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`)
        e.target.value = ''
        return
      }
      setFile(selectedFile)
      setFileError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setFileError('Please select a file.')
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    setFileError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        throw new Error(error.error || 'Failed to upload file')
      }

      const uploadData = await uploadResponse.json()

      const response = await fetch('/api/scans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'file',
          target: file.name,
          projectId: selectedProjectId || null,
          fileHash: uploadData.fileHash,
          fileSize: uploadData.fileSize,
          metadata: {
            fileId: uploadData.fileId,
            filePath: uploadData.filePath,
            mimeType: uploadData.mimeType,
            lastModified: file.lastModified,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create scan')
      }

      const data = await response.json()
      const scanId = data?.scan?.id
      if (scanId) {
        router.push(`/dashboard/scans/${scanId}`)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error creating scan:', error)
      setFormError(error instanceof Error ? error.message : 'Failed to create scan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative z-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200/70 pb-6 dark:border-slate-800/80">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="w-fit text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
              File Scan
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Upload a file to scan it for threats.
            </p>
          </div>
        </div>

        <Card className="border border-slate-200/60 bg-slate-50/80 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Upload file</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              Supported size up to {MAX_FILE_SIZE / 1024 / 1024}MB.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-6">
              {formError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="file" className="text-left">
                  File
                </Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  required
                  disabled={isSubmitting}
                />
                {file && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                {fileError ? (
                  <p className="text-xs text-red-600">{fileError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: {MAX_FILE_SIZE / 1024 / 1024}MB
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="project" className="text-left">
                  Project (Optional)
                </Label>
                <select
                  id="project"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  disabled={isSubmitting || isLoadingProjects}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">No Project</option>
                  {isLoadingProjects && (
                    <option value="" disabled>
                      Loading projects...
                    </option>
                  )}
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Start Scan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
