'use client'
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@scrutis/ui/components/dialog"
import { Plus, Upload, Link2, Loader2 } from 'lucide-react'
import { Button } from '@scrutis/ui/components/button'
import { Label } from '@scrutis/ui/components/label'
import { Input } from '@scrutis/ui/components/input'
import { useRouter } from 'next/navigation'

type ScanType = 'file' | 'url' | null;

type Project = {
  id: string;
  name: string;
  description: string | null;
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const CreateScan = () => {
  const [open, setOpen] = useState(false);
  const [scanType, setScanType] = useState<ScanType>(null);
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open]);

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file size
      if (selectedFile.size > MAX_FILE_SIZE) {
        alert(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scanType) {
      return;
    }

    setIsLoading(true);

    try {
      if (scanType === 'url') {
        if (!url) {
          alert('Please enter a URL');
          setIsLoading(false);
          return;
        }

        // Validate URL format
        try {
          new URL(url);
        } catch {
          alert('Please enter a valid URL');
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/scans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'url',
            target: url,
            projectId: selectedProjectId || null,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create scan');
        }

        const data = await response.json();
        setOpen(false);
        setScanType(null);
        setUrl('');
        setSelectedProjectId("");
        router.refresh();
      } else if (scanType === 'file') {
        if (!file) {
          alert('Please select a file');
          setIsLoading(false);
          return;
        }

        // Validate file size again
        if (file.size > MAX_FILE_SIZE) {
          alert(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
          setIsLoading(false);
          return;
        }

        // Upload file first
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error || 'Failed to upload file');
        }

        const uploadData = await uploadResponse.json();

        // Create scan with uploaded file info
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
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create scan');
        }

        const data = await response.json();
        setOpen(false);
        setScanType(null);
        setFile(null);
        setSelectedProjectId("");
        router.refresh();
      }
    } catch (error) {
      console.error('Error creating scan:', error);
      alert(error instanceof Error ? error.message : 'Failed to create scan');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setScanType(null);
    setUrl('');
    setFile(null);
    setSelectedProjectId("");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="bg-background text-foreground hover:bg-background/70">
          <Plus className="w-4 h-4 mr-2" />
          New Scan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Scan</DialogTitle>
            <DialogDescription>
              Choose a scan type and submit a file or URL for threat detection.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!scanType ? (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => setScanType('file')}
                >
                  <Upload className="w-6 h-6" />
                  <span>File Scan</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => setScanType('url')}
                >
                  <Link2 className="w-6 h-6" />
                  <span>URL Scan</span>
                </Button>
              </div>
            ) : scanType === 'url' ? (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="url" className="text-left">
                    URL to Scan
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter a URL to scan for malicious content
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="project-url" className="text-left">
                    Project (Optional)
                  </Label>
                  <select
                    id="project-url"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    disabled={isLoading || isLoadingProjects}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">No Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="file" className="text-left">
                    File to Scan
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    required
                    disabled={isLoading}
                  />
                  {file && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: {MAX_FILE_SIZE / 1024 / 1024}MB
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="project-file" className="text-left">
                    Project (Optional)
                  </Label>
                  <select
                    id="project-file"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    disabled={isLoading || isLoadingProjects}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">No Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            {scanType && (
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isLoading}
              >
                Back
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            {scanType && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Start Scan'
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
