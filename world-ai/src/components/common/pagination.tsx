import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) => {
  const [inputPage, setInputPage] = useState(currentPage.toString());

  const handlePageSizeChange = (value: string) => {
    onPageSizeChange(Number(value));
  };

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const page = parseInt(inputPage);
      if (page >= 1 && page <= totalPages) {
        onPageChange(page);
      } else {
        setInputPage(currentPage.toString());
      }
    }
  };

  const handleFirstPage = () => onPageChange(1);
  const handlePrevPage = () => onPageChange(currentPage - 1);
  const handleNextPage = () => onPageChange(currentPage + 1);
  const handleLastPage = () => onPageChange(totalPages);

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} -{" "}
          {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
        </span>
        <Select
          value={pageSize.toString()}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="w-[100px] bg-background/50 border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="20">20 / page</SelectItem>
            <SelectItem value="50">50 / page</SelectItem>
            <SelectItem value="100">100 / page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleFirstPage}
          disabled={currentPage === 1}
          className="h-8 w-8 bg-background/50 border-border/50"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="h-8 w-8 bg-background/50 border-border/50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            onKeyDown={handlePageInput}
            className="w-16 h-8 bg-background/50 border-border/50 focus:border-[#8B5CF6] transition-colors text-center"
          />
          <span className="text-sm text-muted-foreground">
            of {totalPages}
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="h-8 w-8 bg-background/50 border-border/50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleLastPage}
          disabled={currentPage === totalPages}
          className="h-8 w-8 bg-background/50 border-border/50"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
