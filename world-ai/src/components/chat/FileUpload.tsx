import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string;
}

const FileUpload = ({ onFileSelect, acceptedTypes = "image/*,audio/*" }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedTypes}
        className="hidden"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className="hover:bg-muted h-8 w-8"
      >
        <Paperclip className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default FileUpload; 