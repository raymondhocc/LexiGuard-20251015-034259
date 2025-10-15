import React, { useRef, useState } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
interface FileUploadButtonProps extends ButtonProps {
  onFileRead: (content: string) => void;
  acceptedFileTypes?: string;
}
export function FileUploadButton({
  onFileRead,
  acceptedFileTypes = '.txt,.md,.json,.csv',
  children = 'Upload File',
  ...props
}: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileRead(content);
      setIsLoading(false);
      toast.success(`File "${file.name}" loaded successfully.`);
    };
    reader.onerror = () => {
      setIsLoading(false);
      toast.error(`Failed to read file "${file.name}".`);
    };
    reader.readAsText(file);
    // Reset file input value to allow re-uploading the same file
    event.target.value = '';
  };
  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        className="hidden"
      />
      <Button onClick={handleButtonClick} disabled={isLoading} {...props}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {isLoading ? 'Loading...' : children}
      </Button>
    </>
  );
}