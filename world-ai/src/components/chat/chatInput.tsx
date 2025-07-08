import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Send, Plus, Image, FileText, Video, Music, Settings, Brush } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

import settingService, { UserSettings } from "@/services/setting.service";
import Helpers from "@/config/helpers";
import { PROMPT_CATEGORIES } from "@/constants/promptCategories";
import { useNavigate } from "react-router-dom";
import ImageSettings from "@/components/settings/ImageSettings";
import VideoSettings from "@/components/settings/VideoSettings";

interface ChatInputProps {
  onSendMessage: (message: string, file?: File) => void;
  isLoading?: boolean;
  className?: string;
  message?: string;
  setMessage?: (message: string) => void;
}

const FilePreview = ({ file, onRemove }: { file: File, onRemove: () => void }) => {
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  return (
    <div className="relative w-16 h-16 border rounded-lg overflow-hidden bg-white">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute top-0 right-0 h-4 w-4 p-0 z-10 bg-background/80 rounded-full m-1"
        onClick={onRemove}
      >
        ×
      </Button>
      {file.type.startsWith('image/') ? (
        <img src={preview} alt="preview" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
          {file.type.split('/')[0]}
        </div>
      )}
    </div>
  );
};

const ChatInput = ({ onSendMessage, className, message = "", setMessage, isLoading }: ChatInputProps) => {
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    category: 'default',
    imageSetting: {
      aspectRatio: '1:1',
      width: 1024,
      height: 1024
    },
    videoSetting: {
      width: 1024,
      height: 576,
      aspectRatio: '16:9',
      duration: 5,
    }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch user settings when component mounts
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const data = await settingService.getUserSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      Helpers.showToast('Failed to load settings', 'error');
    }
  };

  const updateSettings = async (newSettings: UserSettings) => {
    try {
      const { settings: updatedSettings } = await settingService.updateUserSettings(newSettings);
      setSettings(updatedSettings);
      setIsSettingsOpen(false);
      Helpers.showToast('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      Helpers.showToast('Failed to update settings', 'error');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || attachedFiles.length > 0 || selectedFile) {
      onSendMessage(message, selectedFile || undefined);
      if (setMessage) {
        setMessage("");
      }
      setAttachedFiles([]);
      setSelectedFile(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (type: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFile(files[0]); // Only use the first file
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative px-2 py-2 max-w-3xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className={cn("w-full", className)}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="max-w-3xl relative flex items-end gap-2">
          <div className="flex gap-2">
            <Button 
              type="button"
              variant="ghost" 
              onClick={() => setIsSettingsOpen(true)} 
              className="h-10 w-10 flex-shrink-0 self-center bg-accent rounded-full hover:bg-secondary cursor-pointer transition-colors"
            >
              <Settings className="h-10 w-10 text-4xl text-white" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 w-10 flex-shrink-0 self-center bg-accent rounded-full hover:bg-secondary cursor-pointer transition-colors"
                >
                  <Plus className="h-10 w-10 text-4xl text-white" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <div className="space-y-1">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-start h-9 text-sm hover:bg-muted/50 rounded-md"
                    onClick={() => handleFileSelect("image/*")}
                  >
                    <Image className="h-4 w-4 mr-2 text-muted-foreground" />
                    Upload Image
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-start h-9 text-sm hover:bg-muted/50 rounded-md"
                    onClick={() => handleFileSelect("video/*")}
                  >
                    <Video className="h-4 w-4 mr-2 text-muted-foreground" />
                    Upload Video
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-start h-9 text-sm hover:bg-muted/50 rounded-md"
                    onClick={() => navigate("/chat/inpaint")}
                  >
                    <Brush className="h-4 w-4 mr-2 text-muted-foreground" />
                    Inpaint Image
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-start h-9 text-sm hover:bg-muted/50 rounded-md"
                    onClick={() => handleFileSelect("audio/*")}
                  >
                    <Music className="h-4 w-4 mr-2 text-muted-foreground" />
                    Upload Audio
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-start h-9 text-sm hover:bg-muted/50 rounded-md"
                    onClick={() => handleFileSelect(".pdf,.doc,.docx")}
                  >
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    Upload Document
                  </Button>

                </div>
              </PopoverContent>
            </Popover>
          </div>
         

          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Media Settings</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={settings.category}
                    onValueChange={(value) => setSettings({ ...settings, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROMPT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <ImageSettings
                  aspectRatio={settings.imageSetting.aspectRatio}
                  width={settings.imageSetting.width}
                  height={settings.imageSetting.height}
                  onSettingsChange={(imageSettings: any) =>
                    setSettings({
                      ...settings,
                      imageSetting: imageSettings,
                    })
                  }
                />

                <VideoSettings
                  aspectRatio={settings.videoSetting.aspectRatio}
                  duration={settings.videoSetting.duration}
                  onSettingsChange={(videoSettings: any) =>
                    setSettings({
                      ...settings,
                      videoSetting: videoSettings,
                    })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => updateSettings(settings)}>
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex-1 relative">
            {selectedFile && (
              <div className="absolute -top-20 left-0">
                <FilePreview file={selectedFile} onRemove={() => setSelectedFile(null)} />
              </div>
            )}
            <Textarea
              value={message}
              onChange={(e) => setMessage ? setMessage(e.target.value) : null}
              onKeyDown={handleKeyDown}
              placeholder="Message Awish AI..."
              className="min-h-[48px] max-h-[120px] w-full resize-y py-3 px-4 bg-background/70 border-border/40 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:ring-offset-0 shadow-sm transition-all"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-4 bottom-2 self-center h-8 w-8 rounded-lg bg-primary hover:bg-primary/90 shadow-md transition-colors"
              disabled={(!message.trim() && !selectedFile) || isLoading}
            >
              <Send className="h-4 w-4 text-primary-foreground" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;