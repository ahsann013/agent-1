//@ts-nocheck
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AspectRatio } from "@/services/setting.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VideoSettingsProps {
  aspectRatio: AspectRatio;
  duration: number;
  onSettingsChange: (settings: {
    aspectRatio: AspectRatio;
    width: number;
    height: number;
    duration: number;
  }) => void;
}

const VideoSettings = ({ aspectRatio, duration, onSettingsChange }: VideoSettingsProps) => {
  const getResolutionForRatio = (ratio: AspectRatio): { width: number; height: number } => {
    switch (ratio) {
      case '16:9':
        return { width: 1024, height: 576 };
      case '9:16':
        return { width: 576, height: 1024 };
      case '5:4':
        return { width: 1024, height: 819 };
      case '1:1':
        return { width: 1024, height: 1024 };
      default:
        return { width: 1024, height: 1024 };
    }
  };

  const handleAspectRatioChange = (newRatio: AspectRatio) => {
    // Calculate width and height based on aspect ratio while maintaining approximately 1024px for the larger dimension
    let width = 1024;
    let height = 1024;
    
    switch (newRatio) {
      case '16:9':
        height = Math.round(width * (9/16));
        break;
      case '9:16':
        width = Math.round(height * (9/16));
        break;
      case '5:4':
        height = Math.round(width * (4/5));
        break;
      case '1:1':
        // Both dimensions remain 1024
        break;
    }

    onSettingsChange({
      aspectRatio: newRatio,
      width,
      height,
      duration,
    });
  };

  const handleDurationChange = (newDuration: number) => {
    onSettingsChange({
      aspectRatio,
      width: aspectRatio === '16:9' ? 1024 : 576,
      height: aspectRatio === '16:9' ? 576 : 1024,
      duration: newDuration,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Video Settings</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Aspect Ratio</h3>
          <RadioGroup
            value={aspectRatio}
            onValueChange={handleAspectRatioChange}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {['16:9', '9:16', '1:1'].map((ratio) => {
              const resolution = getResolutionForRatio(ratio as AspectRatio);
              return (
                <div key={ratio} className="flex items-center space-x-2">
                  <RadioGroupItem value={ratio} id={`video-ratio-${ratio}`} />
                  <Label htmlFor={`video-ratio-${ratio}`} className="flex flex-col">
                    <span>{ratio}</span>
                    <span className="text-xs text-muted-foreground">
                      {resolution.width}×{resolution.height}px
                    </span>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Duration</h3>
          <Select
            value={duration.toString()}
            onValueChange={(value) => handleDurationChange(Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10].map((seconds) => (
                <SelectItem key={seconds} value={seconds.toString()}>
                  {seconds} seconds
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default VideoSettings; 