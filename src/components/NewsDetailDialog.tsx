import { Calendar, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import DOMPurify from "dompurify";

interface NewsDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  summary: string;
  content: string;
  date: string;
  author?: string | null;
  image?: string | null;
}

const NewsDetailDialog = ({
  open,
  onOpenChange,
  title,
  summary,
  content,
  date,
  author,
  image,
}: NewsDetailDialogProps) => {
  // Sanitize content to prevent XSS
  const sanitizedContent = DOMPurify.sanitize(content || summary, {
    ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        {/* Image Header */}
        {image && (
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          </div>
        )}

        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="font-mono text-xl md:text-2xl text-foreground leading-tight">
              {title}
            </DialogTitle>
          </DialogHeader>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm font-mono mt-3 mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-primary" />
              {date}
            </span>
            {author && (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4 text-primary" />
                {author}
              </span>
            )}
          </div>

          {/* Content */}
          <ScrollArea className="h-[300px] md:h-[400px] pr-4">
            <div className="space-y-4">
              {/* Summary as lead */}
              {summary && (
                <p className="text-foreground font-medium text-base leading-relaxed border-l-2 border-primary pl-4">
                  {summary}
                </p>
              )}

              {/* Full Content */}
              {content ? (
                <div 
                  className="text-muted-foreground text-sm leading-relaxed prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
              ) : (
                <p className="text-muted-foreground text-sm">
                  No additional content available.
                </p>
              )}
            </div>
          </ScrollArea>

          <div className="pt-4 border-t border-border mt-4">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="w-full font-mono border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsDetailDialog;
