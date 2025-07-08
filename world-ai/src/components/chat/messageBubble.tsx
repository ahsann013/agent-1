// @ts-nocheck
import { cn } from "@/lib/utils";
import { User, Bot, Download, Brush } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CodeBlock from "@/components/chat/codeBlock";
import { useState, useEffect } from "react";
import ClaudeFormatter from "./claudeFormatter";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { watermarkAndDownloadImage } from "@/lib/watermark";
import useUserStore from "@/store/useUserStore";

interface MessageBubbleProps {
  content: string;
  json: {
    message: string;
    imageUrl: string | null;
    videoUrl: string | null;
    audioUrl: string | null;
    modelUrl: string | null;
    code: string;
  };
  timestamp: string;
  userAvatar?: string;
  role: "user" | "assistant";
  fileUrl?: string;
  fileType?: "image" | "video" | "audio";
  isLastMessage?: boolean;
  isImageLoading?: boolean;
}

const MessageBubble = ({
  content,
  json,
  timestamp,
  userAvatar,
  role = "user",
  fileUrl,
  fileType,
  isImageLoading = false,
}: MessageBubbleProps) => {
  const [parsedContent, setParsedContent] = useState<any>(null);

  const navigate = useNavigate();
  const { user } = useUserStore();

  // Format timestamp to locale string
  const formattedTimestamp = new Date(timestamp).toLocaleString();
  const chatId = useParams().id;
  useEffect(() => {
    if (role === "assistant") {
      try {
        let finalContent;
        // First try to parse the json prop
        const parsed = typeof json === "string" ? JSON.parse(json) : json;

        // Check if parsed is already the complete object with message/imageUrl/videoUrl
        if (
          parsed &&
          typeof parsed === "object" &&
          ("message" in parsed ||
            "imageUrl" in parsed ||
            "videoUrl" in parsed ||
            "audioUrl" in parsed ||
            "modelUrl" in parsed ||
            "code" in parsed)
        ) {
          finalContent = parsed;
        }
        // Handle case where parsed.message is a string that needs to be parsed
        else if (parsed.message && typeof parsed.message === "string") {
          try {
            const messageContent = JSON.parse(parsed.message);
            // If messageContent contains modelUrl, ensure it's preserved
            if (typeof messageContent === "object" && messageContent !== null) {
              finalContent = messageContent;
            } else {
              finalContent = { message: messageContent };
            }
          } catch {
            // If parsing fails, use the message string directly
            finalContent = { message: parsed.message };
          }
        } else {
          // If message is already an object or other cases
          finalContent = parsed;
        }

        setParsedContent(finalContent);
      } catch (error) {
        console.error("Error parsing message:", error);
        // If all parsing fails, try to use the json prop directly
        setParsedContent(typeof json === "object" ? json : { message: json });
      }
    }
  }, [role, json]);

  const getIcon = () => {
    if (role === "user") {
      return (
        <Avatar className="h-8 w-8 border border-border/50">
          <AvatarImage src={userAvatar} />
          <AvatarFallback className="bg-primary/5">
            <User className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
      );
    }
    return (
      <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
        <Bot className="h-5 w-5 text-primary" />
      </div>
    );
  };

  const getBubbleStyle = () => {
    return role === "user"
      ? "bg-primary text-primary-foreground rounded-tr-sm shadow-sm"
      : "bg-muted rounded-tl-sm shadow-sm border border-border/10";
  };

  // Check if there's any media to display
  const hasMedia =
    role === "assistant"
      ? !!(
          parsedContent?.imageUrl ||
          json.imageUrl ||
          parsedContent?.videoUrl ||
          json.videoUrl ||
          parsedContent?.audioUrl ||
          json.audioUrl ||
          parsedContent?.code
        )
      : !!(fileUrl && fileType);

  const handleEditImage = (imageUrl: string, chatId: string) => {
    navigate("/chat/inpaint", { state: { imageUrl, chatId } });
  };

  return (
    <div className="group relative mb-6">
      <div
        className={cn(
          "flex items-start gap-3",
          role === "user" ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* Avatar */}
        <div className="flex-shrink-0 pt-1">{getIcon()}</div>

        <div className="flex flex-col gap-2 w-full max-w-[calc(100%-4rem)]">
          {/* Message Content */}
          <div
            className={cn(
              "relative rounded-2xl px-4 py-3",
              "max-w-fit",
              "break-words",
              getBubbleStyle(),
              role === "user" ? "ml-auto" : "mr-auto"
            )}
          >
            <div className="whitespace-pre-wrap">
              {role === "assistant" ? (
                <div className="prose dark:prose-invert prose-sm max-w-none">
                  <ClaudeFormatter
                    response={parsedContent?.message || json.message}
                    writing={false}
                  />

                  {/* Render 3D model inside the message bubble */}
                  {(parsedContent?.modelUrl || json.modelUrl) && (
                    <>
                      <div className="mt-4 pt-3 border-t border-border/30">
                        <a
                          href={parsedContent?.modelUrl || json.modelUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors font-medium text-sm"
                        >
                          <Download className="h-4 w-4" />
                          Download 3D Model
                        </a>
                        <p className="text-xs text-muted-foreground mt-2">
                          View this model in 3D by downloading it and opening in
                          a compatible viewer
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="prose dark:prose-invert prose-sm max-w-none">
                  {content}
                </div>
              )}
            </div>
          </div>

          {/* Media Content - Outside the bubble */}
          <div
            className={cn(
              "w-full",
              role === "user" ? "flex justify-end" : "flex justify-start",
              !hasMedia && "hidden"
            )}
          >
            <div
              className={cn(
                "rounded-lg overflow-hidden max-w-[80%] sm:max-w-[75%] md:max-w-[70%]",
                role === "user" ? "ml-auto" : "mr-auto"
              )}
            >
              {/* Assistant Media */}
              {role === "assistant" && (
                <>
                  {parsedContent?.code && (
                    <div className="mb-3 w-full">
                      <CodeBlock
                        code={parsedContent?.code}
                        language="javascript"
                        showLineNumbers={false}
                      />
                    </div>
                  )}
                  {(parsedContent?.imageUrl || json.imageUrl) && (
                    <div className="mb-3 relative group/media">
                      <img
                        src={parsedContent?.imageUrl || json.imageUrl}
                        alt="Assistant provided image"
                        className="w-auto h-auto rounded-lg object-cover max-h-[300px] cursor-pointer"
                        loading="lazy"
                        onClick={() => {
                          const fullscreenDiv = document.createElement("div");
                          fullscreenDiv.className =
                            "fixed inset-0 z-50 bg-black/80 flex items-center justify-center cursor-pointer";
                          fullscreenDiv.onclick = () =>
                            document.body.removeChild(fullscreenDiv);

                          const img = document.createElement("img");
                          img.src = parsedContent?.imageUrl || json.imageUrl;
                          img.className =
                            "max-w-[95vw] max-h-[95vh] object-contain";
                          img.alt = "Full screen image";

                          fullscreenDiv.appendChild(img);
                          document.body.appendChild(fullscreenDiv);
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          watermarkAndDownloadImage(
                            parsedContent?.imageUrl || json.imageUrl,
                            "/assets/logo-dark.png",
                            "image.png",
                            user?.type || "normal"
                          );
                        }}
                        className="absolute cursor-pointer bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm opacity-0 group-hover/media:opacity-100 transition-opacity duration-200"
                        title="Download image"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditImage(
                            parsedContent?.imageUrl || json.imageUrl,
                            chatId
                          );
                        }}
                        className="absolute cursor-pointer bottom-2 right-12 bg-primary/50 hover:bg-primary/70 text-white rounded-full p-2.5 backdrop-blur-sm opacity-0 group-hover/media:opacity-100 transition-opacity duration-200"
                        title="Edit image"
                      >
                        <Brush className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                  {(parsedContent?.videoUrl || json.videoUrl) && (
                    <div className="mb-3">
                      <video
                        controls
                        className="w-full h-auto rounded-lg max-h-[500px]"
                        preload="metadata"
                      >
                        <source
                          src={parsedContent?.videoUrl || json.videoUrl}
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  {(parsedContent?.audioUrl || json.audioUrl) && (
                    <div className="mb-3">
                      <audio
                        controls
                        className="w-full"
                        style={{ minWidth: "250px" }}
                        preload="metadata"
                      >
                        <source
                          src={parsedContent?.audioUrl || json.audioUrl}
                          type="audio/mpeg"
                        />
                        Your browser does not support the audio tag.
                      </audio>
                    </div>
                  )}
                </>
              )}

              {/* User Media */}
              {role === "user" && fileUrl && (
                <>
                  {fileType === "image" && (
                    <div className="mb-3 relative group/media">
                      {isImageLoading ? (
                        <div className="w-full h-[300px] rounded-lg bg-muted animate-pulse" />
                      ) : (
                        <img
                          src={fileUrl}
                          alt="User uploaded content"
                          className="w-auto h-auto rounded-lg object-cover max-h-[300px] cursor-pointer"
                          loading="lazy"
                          onClick={() => {
                            const fullscreenDiv = document.createElement("div");
                            fullscreenDiv.className =
                              "fixed inset-0 z-50 bg-black/80 flex items-center justify-center cursor-pointer";
                            fullscreenDiv.onclick = () =>
                              document.body.removeChild(fullscreenDiv);

                            const img = document.createElement("img");
                            img.src = fileUrl;
                            img.className =
                              "max-w-[95vw] max-h-[95vh] object-contain";
                            img.alt = "Full screen image";

                            fullscreenDiv.appendChild(img);
                            document.body.appendChild(fullscreenDiv);
                          }}
                        />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Create an XMLHttpRequest to fetch the image
                          const xhr = new XMLHttpRequest();
                          xhr.open("GET", fileUrl, true);
                          xhr.responseType = "blob";
                          xhr.onload = function () {
                            if (this.status === 200) {
                              // Create blob URL
                              const blob = new Blob([this.response], {
                                type: "image/png",
                              });
                              const blobUrl = URL.createObjectURL(blob);

                              // Create download link and trigger click
                              const link = document.createElement("a");
                              link.href = blobUrl;
                              link.download = "image.png";
                              document.body.appendChild(link);
                              link.click();

                              // Clean up
                              setTimeout(() => {
                                document.body.removeChild(link);
                                URL.revokeObjectURL(blobUrl);
                              }, 100);
                            }
                          };
                          xhr.send();
                        }}
                        className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm opacity-0 group-hover/media:opacity-100 transition-opacity duration-200"
                        title="Download image"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditImage(fileUrl);
                        }}
                        className="absolute bottom-2 right-12 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm opacity-0 group-hover/media:opacity-100 transition-opacity duration-200"
                        title="Edit image"
                      >
                        <Brush className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {fileType === "video" && (
                    <div className="mb-3">
                      <video
                        controls
                        className="w-full h-auto rounded-lg max-h-[500px]"
                        preload="metadata"
                      >
                        <source src={fileUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  {fileType === "audio" && (
                    <div className="mb-3">
                      <audio
                        controls
                        className="w-full"
                        style={{ minWidth: "250px" }}
                        preload="metadata"
                      >
                        <source src={fileUrl} type="audio/mpeg" />
                        Your browser does not support the audio tag.
                      </audio>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Timestamp (appears on hover) */}
        <span
          className={cn(
            "absolute -bottom-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity",
            role === "user" ? "right-12" : "left-12",
            "text-muted-foreground whitespace-nowrap"
          )}
        >
          {formattedTimestamp}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
