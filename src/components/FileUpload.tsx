import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { X, UploadSimple, File as FileIcon, Check, Warning } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export interface UploadedFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  dataUrl?: string
}

interface FileUploadProps {
  files: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
  maxFiles?: number
  maxFileSize?: number
  acceptedTypes?: string[]
  className?: string
}

export function FileUpload({
  files,
  onChange,
  maxFiles = 10,
  maxFileSize = 100 * 1024 * 1024,
  acceptedTypes = ['.pdf', '.ai', '.eps', '.jpg', '.jpeg', '.png', '.tif', '.tiff'],
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `Datei zu groß (max. ${formatFileSize(maxFileSize)})`
    }

    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedTypes.some(type => extension === type.toLowerCase())) {
      return `Dateityp nicht unterstützt (erlaubt: ${acceptedTypes.join(', ')})`
    }

    return null
  }

  const simulateUpload = (fileId: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        onChange(files.map(f => 
          f.id === fileId 
            ? { ...f, progress: 100, status: 'success' as const }
            : f
        ))
      } else {
        onChange(files.map(f => 
          f.id === fileId 
            ? { ...f, progress: Math.min(progress, 95), status: 'uploading' as const }
            : f
        ))
      }
    }, 200)
  }

  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    const fileArray = Array.from(fileList)
    
    if (files.length + fileArray.length > maxFiles) {
      alert(`Maximal ${maxFiles} Dateien erlaubt`)
      return
    }

    const newFiles: UploadedFile[] = []

    for (const file of fileArray) {
      const error = validateFile(file)
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      let dataUrl: string | undefined
      if (file.type.startsWith('image/')) {
        dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })
      }

      newFiles.push({
        id,
        file,
        progress: 0,
        status: error ? 'error' : 'pending',
        error: error || undefined,
        dataUrl,
      })
    }

    const updatedFiles = [...files, ...newFiles]
    onChange(updatedFiles)

    newFiles.forEach(uploadedFile => {
      if (uploadedFile.status !== 'error') {
        simulateUpload(uploadedFile.id)
      }
    })
  }, [files, maxFiles, onChange])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  const removeFile = (fileId: string) => {
    onChange(files.filter(f => f.id !== fileId))
  }

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0)

  return (
    <div className={cn('space-y-4', className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer',
          isDragging 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-border hover:border-primary hover:bg-accent/5'
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadSimple 
          className={cn(
            'w-12 h-12 mx-auto mb-3 transition-colors',
            isDragging ? 'text-primary' : 'text-muted-foreground'
          )} 
        />
        <p className="font-medium mb-1">
          {isDragging ? 'Dateien hier ablegen...' : 'Dateien hier ablegen oder klicken'}
        </p>
        <p className="text-sm text-muted-foreground mb-3">
          {acceptedTypes.join(', ')} - max. {formatFileSize(maxFileSize)} pro Datei
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          Bis zu {maxFiles} Dateien gleichzeitig möglich
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            fileInputRef.current?.click()
          }}
        >
          Dateien auswählen
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {files.length} {files.length === 1 ? 'Datei' : 'Dateien'} ({formatFileSize(totalSize)})
            </span>
            {files.some(f => f.status === 'success') && (
              <span className="text-xs text-muted-foreground">
                {files.filter(f => f.status === 'success').length} erfolgreich hochgeladen
              </span>
            )}
          </div>
          
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {files.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className={cn(
                  'flex items-start gap-3 p-3 border rounded-lg transition-all',
                  uploadedFile.status === 'error' && 'border-destructive bg-destructive/5',
                  uploadedFile.status === 'success' && 'border-green-500/50 bg-green-500/5',
                  uploadedFile.status === 'uploading' && 'border-primary/50 bg-primary/5'
                )}
              >
                {uploadedFile.dataUrl ? (
                  <img
                    src={uploadedFile.dataUrl}
                    alt={uploadedFile.file.name}
                    className="w-12 h-12 object-cover rounded flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center flex-shrink-0">
                    <FileIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 flex-shrink-0"
                      onClick={() => removeFile(uploadedFile.id)}
                      type="button"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {uploadedFile.status === 'uploading' && (
                    <div className="space-y-1">
                      <Progress value={uploadedFile.progress} className="h-1" />
                      <p className="text-xs text-muted-foreground">
                        {Math.round(uploadedFile.progress)}% hochgeladen...
                      </p>
                    </div>
                  )}

                  {uploadedFile.status === 'success' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="text-xs font-medium">Erfolgreich hochgeladen</span>
                    </div>
                  )}

                  {uploadedFile.status === 'error' && uploadedFile.error && (
                    <div className="flex items-center gap-1 text-destructive">
                      <Warning className="w-4 h-4" />
                      <span className="text-xs font-medium">{uploadedFile.error}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
