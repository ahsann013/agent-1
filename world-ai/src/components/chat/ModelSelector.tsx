import { useState, useRef, useEffect } from "react";
import { ChevronDown, Sparkles, Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Model {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  icon?: string;
  context?: string;
}

const models: Model[] = [
  {
    id: "gpt-4",
    name: "GPT-4 Turbo",
    description: "Most capable model for complex tasks",
    isPremium: true,
    context: "128k context",
  },
  {
    id: "claude-3",
    name: "Claude 3",
    description: "Advanced reasoning and analysis",
    isPremium: true,
    context: "100k context",
  },
  {
    id: "gpt-3.5",
    name: "GPT-3.5 Turbo",
    description: "Fast and efficient for most tasks",
    isPremium: false,
    context: "16k context",
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    description: "Google's advanced AI model",
    isPremium: true,
    context: "32k context",
  },
  {
    id: "mistral",
    name: "Mistral",
    description: "Open source, efficient model",
    isPremium: false,
    context: "8k context",
  },
  {
    id: "llama",
    name: "Llama 2",
    description: "Meta's open source model",
    isPremium: false,
    context: "4k context",
  }
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  isPremiumUser?: boolean;
}

const ModelSelector = ({ selectedModel, onModelChange, isPremiumUser = false }: ModelSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentModel = models.find(model => model.id === selectedModel);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-[200px] px-3 py-2 text-sm",
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          "border rounded-lg transition-all duration-200",
          "hover:bg-accent/50",
          isOpen && "ring-2 ring-ring/50"
        )}
      >
        <div className="flex items-center gap-2">
          {currentModel?.isPremium && (
            <Sparkles className="h-4 w-4 text-primary" />
          )}
          <span>{currentModel?.name || "Select Model"}</span>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform duration-200",
          isOpen && "transform rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-[280px] rounded-lg border bg-background shadow-lg z-[400]">
          <div className="p-2 space-y-1">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  if (!model.isPremium || isPremiumUser) {
                    onModelChange(model.id);
                    setIsOpen(false);
                  }
                }}
                disabled={model.isPremium && !isPremiumUser}
                className={cn(
                  "w-full flex items-start gap-3 p-2 rounded-md text-left transition-colors",
                  "hover:bg-muted/50",
                  selectedModel === model.id && "bg-muted",
                  model.isPremium && !isPremiumUser && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {model.isPremium ? (
                    <Sparkles className="h-4 w-4 text-primary" />
                  ) : (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{model.name}</span>
                    {model.isPremium && !isPremiumUser && (
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {model.description}
                  </p>
                  <span className="text-[10px] text-primary/70 font-medium">
                    {model.context}
                  </span>
                </div>

                {selectedModel === model.id && (
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-2" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector; 