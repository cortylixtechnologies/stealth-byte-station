import { useState } from "react";
import { FileText, Download, ExternalLink, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PdfViewerProps {
  url: string;
  title: string;
}

const PdfViewer = ({ url, title }: PdfViewerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Use Google Docs viewer for PDF rendering
  const getViewerUrl = (pdfUrl: string) => {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
  };

  return (
    <>
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-muted/50 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <span className="font-mono text-sm text-foreground">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(true)}
              className="font-mono"
            >
              <Maximize2 className="w-4 h-4 mr-1" />
              Fullscreen
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="font-mono"
            >
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                Open
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="font-mono"
            >
              <a href={url} download>
                <Download className="w-4 h-4 mr-1" />
                Download
              </a>
            </Button>
          </div>
        </div>
        <div className="aspect-[4/3] bg-muted">
          <iframe
            src={getViewerUrl(url)}
            title={title}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 bg-background border-border">
          <DialogHeader className="p-4 border-b border-border">
            <DialogTitle className="font-mono text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-[calc(90vh-80px)]">
            <iframe
              src={getViewerUrl(url)}
              title={title}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PdfViewer;
