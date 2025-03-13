
import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { UploadCloud, File, X } from 'lucide-react';
import { useDocuments } from '../hooks/useDocuments';
import { toast } from '../components/ui/use-toast';
import { formatFileSize, isFileTypeSupported } from '../utils/fileUtils';

const FileUploader: React.FC = () => {
  const { uploadDocument, isLoading } = useDocuments();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles: File[] = [];
    const invalidFiles: File[] = [];
    
    files.forEach(file => {
      if (isFileTypeSupported(file)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    });
    
    if (invalidFiles.length > 0) {
      toast({
        title: 'Unsupported file type',
        description: `${invalidFiles.length} file(s) were not added because they are not supported.`,
        variant: 'destructive'
      });
    }
    
    setSelectedFiles(validFiles);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    const uploadPromises = selectedFiles.map(file => uploadDocument(file));
    try {
      await Promise.all(uploadPromises);
      toast({
        title: 'Files uploaded',
        description: `Successfully uploaded ${selectedFiles.length} file(s).`
      });
      setSelectedFiles([]);
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your files.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <UploadCloud className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-1">Upload your files</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Drag and drop your files here or click to browse
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.txt,.md,.markdown,.docx"
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          Select Files
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          Supported formats: PDF, TXT, MD, DOCX
        </p>
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Selected Files</h4>
          <div className="space-y-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md animate-fade-in">
                <div className="flex items-center">
                  <File className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" className="mr-2" onClick={() => setSelectedFiles([])}>
              Clear All
            </Button>
            <Button onClick={handleUpload} disabled={isLoading}>
              {isLoading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
