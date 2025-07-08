import { X } from "lucide-react";

import { useEffect, useRef } from "react";

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

const FilePreview = ({ file, onRemove }: FilePreviewProps) => {
  const previewUrl = useRef<string>("");

  useEffect(() => {
    if (file) {
      previewUrl.current = URL.createObjectURL(file);
      return () => {
        URL.revokeObjectURL(previewUrl.current);
      };
    }
  }, [file]);

  const renderPreview = () => {
    const fileType = file.type.split("/")[0];

    switch (fileType) {
      case "image":
        return (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden">
            <img
              src={previewUrl.current}
              alt={file.name}

              className="object-cover"
            />
          </div>
        );
      case "video":
        return (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden">
            <video
              src={previewUrl.current}
              className="w-full h-full object-cover"
            />
          </div>
        );
      case "audio":
        return (
          <div className="relative w-20 h-20 rounded-lg bg-secondary flex items-center justify-center">
            <audio 
              src={previewUrl.current} 
              controls 
              style={{ width: "100%", height: "40px" }} 
            />
          </div>
        );
      default:
        return (
          <div className="relative w-20 h-20 rounded-lg bg-secondary flex items-center justify-center">
            <span className="text-xs text-center break-words px-2">
              {file.name}
            </span>
          </div>
        );
    }
  };

  return (
    <div className="relative group">
      {renderPreview()}
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3 text-destructive-foreground" />
      </button>
    </div>
  );
};

export default FilePreview; 