//@ts-nocheck
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageSquare } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface ChatHistoryItemProps {
  id: string;
  title: string;
  date: string;
  isCollapsed: boolean;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onEdit: (id: string) => void;
}

export function ChatHistoryItem({
  id,
  title,
  date,
  isCollapsed,
  onDelete,
  onEdit,
}: ChatHistoryItemProps) {
  const navigate = useNavigate();
  const { id: currentChatId } = useParams();
  const isActive = currentChatId === id;
  return (
    <div className="group relative">
      <button 
        className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left transition-colors ${isActive ? 'bg-muted' : ''}`} 
        onClick={() => navigate(`/chat/${id}`)}
      >
        <MessageSquare
          className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'} flex-shrink-0 ${
            isCollapsed ? "mx-auto" : ""
          }`}
        />
        {!isCollapsed && (
          <div className="flex-1 truncate">
            <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : ''}`}>{title}</p>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>
        )}
        {!isCollapsed && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-100 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={() => onArchive(id)}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem> */}
              <DropdownMenuItem
                onClick={() => onDelete(id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </button>
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-background/90 rounded-md border invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-50 whitespace-nowrap">
          <p className="text-sm">{title}</p>
        </div>
      )}
    </div>
  );
} 