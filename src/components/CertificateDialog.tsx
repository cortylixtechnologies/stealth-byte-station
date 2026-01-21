import { useState, useRef } from "react";
import { Award, Download, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CertificateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  certificateNumber: string;
  courseName: string;
  userName: string;
  issuedDate: string;
  isApproved?: boolean;
}

const CertificateDialog = ({
  isOpen,
  onClose,
  certificateNumber,
  courseName,
  userName,
  issuedDate,
  isApproved = true,
}: CertificateDialogProps) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const formattedDate = new Date(issuedDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    setDownloading(true);
    try {
      // Create a canvas from the certificate div
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#0a0a0a",
        logging: false,
      });
      
      // Convert to image and download
      const link = document.createElement("a");
      link.download = `certificate-${certificateNumber}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.success("Certificate downloaded!");
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast.error("Failed to download certificate");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareText = `I just completed "${courseName}" and earned my certificate! 🎉`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Course Completion Certificate",
          text: shareText,
        });
      } catch (error) {
        // User cancelled or share failed
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareText);
      toast.success("Share text copied to clipboard!");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-foreground flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Certificate of Completion
            {!isApproved && (
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-accent/20 text-accent">
                Pending Approval
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {!isApproved ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
              <Award className="w-10 h-10 text-accent" />
            </div>
            <h3 className="text-xl font-mono font-bold text-foreground mb-2">
              Certificate Pending Approval
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Congratulations on completing the course! Your certificate is awaiting admin approval. 
              You'll be able to download it once it's approved.
            </p>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg inline-block">
              <p className="text-sm font-mono text-muted-foreground">
                Certificate ID: {certificateNumber}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Certificate Preview */}
            <div
              ref={certificateRef}
              className="relative bg-gradient-to-br from-background via-muted/30 to-background border-4 border-primary/30 rounded-lg p-8 md:p-12"
            >
              {/* Decorative corners */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-primary/50" />
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-primary/50" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-primary/50" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-primary/50" />

              {/* Certificate content */}
              <div className="text-center space-y-6">
                {/* Logo/Icon */}
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                    <Award className="w-10 h-10 text-primary" />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-2">
                    Certificate of Completion
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground font-mono">
                    STEALTH BYTE ACADEMY
                  </h2>
                </div>

                {/* Divider */}
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-20 bg-gradient-to-r from-transparent to-primary/50" />
                  <div className="w-2 h-2 rotate-45 bg-primary" />
                  <div className="h-px w-20 bg-gradient-to-l from-transparent to-primary/50" />
                </div>

                {/* Recipient */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    This is to certify that
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-secondary font-mono">
                    {userName}
                  </p>
                </div>

                {/* Course */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    has successfully completed the course
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-foreground font-mono px-4">
                    "{courseName}"
                  </p>
                </div>

                {/* Date */}
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Issued on {formattedDate}
                  </p>
                </div>

                {/* Certificate Number */}
                <div className="pt-6 border-t border-border/50">
                  <p className="text-xs font-mono text-muted-foreground">
                    Certificate ID: {certificateNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 font-mono"
              >
                <Download className="w-4 h-4 mr-2" />
                {downloading ? "Downloading..." : "Download Certificate"}
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex-1 font-mono"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Achievement
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CertificateDialog;
