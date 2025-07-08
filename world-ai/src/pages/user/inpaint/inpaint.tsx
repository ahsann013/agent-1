import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/theme/theme-provider";
import { ImageIcon, Loader2, Trash2, Download, Info } from "lucide-react";
import chatService from "@/services/chat.service";
import Helpers from "@/config/helpers";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { watermarkAndDownloadImage } from "@/lib/watermark";
import useUserStore from "@/store/useUserStore";

const InpaintComponent = () => {
  const { theme } = useTheme();
  const [image, setImage] = useState<string | undefined | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("original");
  const imageRef = useRef<HTMLImageElement>(null);
  const location = useLocation();
  const chatId = location.state?.chatId;
  const { user } = useUserStore();

  // Function to check if string is a URL
  const isUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  // Function to convert image URL to base64
  const urlToBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error("Failed to convert image URL to base64");
    }
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    if (imageUrl) {
      await watermarkAndDownloadImage(
        imageUrl,
        "/assets/logo-dark.png",
        filename,
        user?.type || "normal"
      );
    }
  };

  // Check for image URL in localStorage when component mounts
  useEffect(() => {
    const savedImageUrl = location.state?.imageUrl;
    if (savedImageUrl) {
      setImage(savedImageUrl);
      location.state.imageUrl = null;
    }
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setOutputImage(null); // Reset output when new image is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    multiple: false,
  });

  const handleGenerate = async () => {
    if (!image || !prompt) return;

    setLoading(true);
    try {
      // Check if image is URL and convert to base64 if needed
      let imageToSend = image;
      if (isUrl(image)) {
        imageToSend = await urlToBase64(image);
      }

      // Create message with prompt and image only (no mask)
      const message = {
        prompt: prompt,
        image: imageToSend,
      };

      // Call the inpaint API
      const response = await chatService.inpaint(message, chatId);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.output?.data?.images?.[0]?.url) {
        const generatedImageUrl = response.output.data.images[0].url;
        setOutputImage(generatedImageUrl);
        setActiveTab("generated"); // Switch to generated tab
        Helpers.showToast("Image generated successfully!", "success");
      } else {
        throw new Error("No image generated in the response");
      }
    } catch (error: any) {
      console.error("Error generating inpaint:", error);
      Helpers.showToast(error.message || "Failed to generate image", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "light"
          ? "bg-gradient-to-br from-background via-primary/10 to-secondary/10"
          : "bg-gradient-to-br from-background via-primary/30 to-background"
      } transition-all duration-500`}
    >
      <div className="container mx-auto p-6 h-[calc(100vh-2rem)] flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
              Image Inpainting
            </h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-primary/10 transition-all"
                  >
                    <Info className="w-5 h-5" />
                    <span className="sr-only">Info</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="p-4 max-w-xs bg-background/95 backdrop-blur-sm border-primary/20">
                  <p className="text-sm">
                    Upload an image and provide a prompt describing what you
                    want to generate. The AI will create a new version based on
                    your description.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {image && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setImage(null);
                setOutputImage(null);
              }}
              className="gap-2 hover:scale-105 transition-transform"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset</span>
            </Button>
          )}
        </div>

        {!image ? (
          <Card className="flex-1 border-dashed border-2 hover:border-primary/50 transition-all duration-300">
            <div
              {...getRootProps()}
              className={`h-full flex flex-col items-center justify-center p-12 text-center cursor-pointer transition-all rounded-xl ${
                isDragActive
                  ? "bg-primary/20 scale-[1.02]"
                  : "hover:bg-background/50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="p-10 rounded-full bg-primary/10 mb-8 animate-pulse">
                <ImageIcon className="w-16 h-16 text-primary" />
              </div>
              <h3 className="text-2xl font-medium mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Drag and drop an image here
              </h3>
              <p className="text-foreground/60 mb-8 text-lg">
                or click to select one
              </p>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-10 py-6 text-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                Select Image
              </Button>
              <p className="text-sm text-foreground/40 mt-8">
                Supports PNG, JPG, JPEG
              </p>
            </div>
          </Card>
        ) : (
          <div className="flex-1 grid grid-cols-2 gap-8 overflow-hidden">
            {/* Left Column - Image Viewing */}
            <div className="flex flex-col gap-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="grid grid-cols-2 w-72 p-1 bg-background/50 backdrop-blur-sm">
                    <TabsTrigger
                      value="original"
                      className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                    >
                      Original
                    </TabsTrigger>
                    <TabsTrigger
                      value="generated"
                      disabled={!outputImage}
                      className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                    >
                      Generated
                    </TabsTrigger>
                  </TabsList>

                  {outputImage && (
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          downloadImage(outputImage, "generated-image.png")
                        }
                        className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex-1 h-[calc(100vh-16rem)]">
                  <TabsContent value="original" className="h-full mt-0">
                    <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300">
                      <CardContent className="p-0 h-full flex items-center justify-center">
                        <img
                          src={image || "/placeholder.svg"}
                          alt="Original"
                          className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                          ref={imageRef}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="generated" className="h-full mt-0">
                    <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300">
                      <CardContent className="p-0 h-full flex items-center justify-center">
                        <div className="relative rounded-xl overflow-hidden w-full h-full bg-card/50 p-6">
                          {outputImage ? (
                            <img
                              src={outputImage || "/placeholder.svg"}
                              alt="Generated"
                              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <p className="text-foreground/40 text-lg">
                                Generated image will appear here
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Right Column - Prompt Section */}
            <div className="flex flex-col gap-6">
              <Card className="flex-1 border-2 hover:border-primary/50 transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Inpainting Prompt
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what you want to generate..."
                    className="w-full p-4 rounded-lg bg-card/50 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none flex-1 text-base placeholder:text-foreground/40"
                  />
                  <Button
                    onClick={handleGenerate}
                    disabled={!image || !prompt || loading}
                    size="lg"
                    className="w-full py-6 text-lg font-medium rounded-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 mt-2"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </div>
                    ) : (
                      "Generate Image"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InpaintComponent;
