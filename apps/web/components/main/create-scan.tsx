'use client'
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@scrutis/ui/components/dialog"
import { Plus, Upload, Link2, Loader2 } from 'lucide-react'
import { Button } from '@scrutis/ui/components/button'
import { Label } from '@scrutis/ui/components/label'
import { Input } from '@scrutis/ui/components/input'
import { useRouter } from 'next/navigation'

type ScanType = 'file' | 'url' | null;
type Step = 'type' | 'details' | 'review';

type Project = {
  id: string;
  name: string;
  description: string | null;
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const CreateScan = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('type');
  const [scanType, setScanType] = useState<ScanType>(null);
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
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
        setFileError(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
      setFileError(null);
    }
  };

  const validateDetails = () => {
    let isValid = true;
    setFormError(null);
    setUrlError(null);
    setFileError(null);

    if (!scanType) {
      setFormError('Please choose a scan type.');
      return false;
    }

    if (scanType === 'url') {
      if (!url) {
        setUrlError('Please enter a URL.');
        isValid = false;
      } else {
        try {
          new URL(url);
        } catch {
          setUrlError('Please enter a valid URL.');
          isValid = false;
        }
      }
    }

    if (scanType === 'file') {
      if (!file) {
        setFileError('Please select a file.');
        isValid = false;
      } else if (file.size > MAX_FILE_SIZE) {
        setFileError(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scanType) {
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      if (scanType === 'url') {
        if (!validateDetails()) {
          setIsLoading(false);
          setStep('details');
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

        await response.json();
        setOpen(false);
        setScanType(null);
        setUrl('');
        setSelectedProjectId("");
        setStep('type');
        router.refresh();
      } else if (scanType === 'file') {
        if (!validateDetails()) {
          setIsLoading(false);
          setStep('details');
          return;
        }
        if (!file) {
          setFormError('Please select a file.');
          setIsLoading(false);
          setStep('details');
          return;
        }

        // Upload file first
        const formData = new FormData();
        const selectedFile = file;
        formData.append('file', selectedFile);

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
            target: selectedFile.name,
            projectId: selectedProjectId || null,
            fileHash: uploadData.fileHash,
            fileSize: uploadData.fileSize,
            metadata: {
              fileId: uploadData.fileId,
              filePath: uploadData.filePath,
              mimeType: uploadData.mimeType,
              lastModified: selectedFile.lastModified,
            },
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create scan');
        }

        await response.json();
        setOpen(false);
        setScanType(null);
        setFile(null);
        setSelectedProjectId("");
        setStep('type');
        router.refresh();
      }
    } catch (error) {
      console.error('Error creating scan:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to create scan');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('type');
    setScanType(null);
    setUrl('');
    setFile(null);
    setSelectedProjectId("");
    setFormError(null);
    setUrlError(null);
    setFileError(null);
  };

  const stepIndex = step === 'type' ? 1 : step === 'details' ? 2 : 3;
  const stepProgress = (stepIndex / 3) * 100;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          className="border-slate-200/70 bg-white/70 text-slate-900 shadow-sm hover:bg-white dark:border-slate-800/80 dark:bg-slate-900/40 dark:text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Scan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-slate-200/70 bg-slate-50/70 px-6 py-5 dark:border-slate-800/80 dark:bg-slate-900/40">
            <DialogTitle className="text-lg text-slate-900 dark:text-white">
              New Scan
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-300">
              Choose a scan type and submit a file or URL for threat detection.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 px-6 py-5">
            <div className="grid gap-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Step {stepIndex} of 3</span>
                <span>{step === 'type' ? 'Select type' : step === 'details' ? 'Add details' : 'Review'}</span>
              </div>
              <div className="h-1 w-full rounded-full bg-slate-200/70 dark:bg-slate-800/70">
                <div
                  className="h-1 rounded-full bg-slate-900 dark:bg-white transition-all"
                  style={{ width: `${stepProgress}%` }}
                />
              </div>
            </div>
            {formError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}
            {step === 'type' && (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 border-slate-200/70 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-900/50 dark:text-white"
                  onClick={() => {
                    setScanType('file');
                    setStep('details');
                  }}
                >
                  <Upload className="w-6 h-6" />
                  <span>File Scan</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 border-slate-200/70 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-900/50 dark:text-white"
                  onClick={() => {
                    setScanType('url');
                    setStep('details');
                  }}
                >
                  <Link2 className="w-6 h-6" />
                  <span>URL Scan</span>
                </Button>
              </div>
            )}
            {step === 'details' && scanType === 'url' && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="url" className="text-left">
                    URL to Scan
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (urlError) setUrlError(null);
                    }}
                    placeholder="https://example.com"
                    required
                    disabled={isLoading}
                  />
                  {urlError ? (
                    <p className="text-xs text-red-600">{urlError}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Enter a URL to scan for malicious content
                    </p>
                  )}
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
              </div>
            )}
            {step === 'details' && scanType === 'file' && (
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
                  {fileError ? (
                    <p className="text-xs text-red-600">{fileError}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Maximum file size: {MAX_FILE_SIZE / 1024 / 1024}MB
                    </p>
                  )}
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
              </div>
            )}
            {step === 'review' && (
              <div className="grid gap-4 rounded-lg border border-slate-200/60 bg-slate-50/70 p-4 dark:border-slate-800/70 dark:bg-slate-900/40">
                <div className="text-sm text-muted-foreground">Review your scan details</div>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium text-foreground">
                      {scanType === 'file' ? 'File Scan' : 'URL Scan'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Target</span>
                    <span className="font-medium text-foreground truncate max-w-[260px]">
                      {scanType === 'file' ? file?.name || 'No file selected' : url || 'No URL'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Project</span>
                    <span className="font-medium text-foreground">
                      {selectedProjectId
                        ? projects.find((project) => project.id === selectedProjectId)?.name || 'Selected project'
                        : 'No Project'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="border-t border-slate-200/70 bg-slate-50/50 px-6 py-4 dark:border-slate-800/80 dark:bg-slate-900/30">
            {step === 'review' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('details')}
                disabled={isLoading}
              >
                Back
              </Button>
            )}
            {step === 'details' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('type')}
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
            {step === 'details' && (
              <Button
                type="button"
                onClick={() => {
                  if (validateDetails()) {
                    setStep('review');
                  }
                }}
                disabled={isLoading}
              >
                Review
              </Button>
            )}
            {step === 'review' && (
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
