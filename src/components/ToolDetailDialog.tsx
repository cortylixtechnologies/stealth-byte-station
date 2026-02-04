import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Lock, Unlock, MessageCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ToolDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  description: string;
  category: "free" | "paid";
  icon: React.ReactNode;
  price?: number | null;
  url?: string | null;
  whatsappNumber?: string;
}

const ToolDetailDialog = ({
  open,
  onOpenChange,
  name,
  description,
  category,
  icon,
  price,
  url,
  whatsappNumber = "255762223306",
}: ToolDetailDialogProps) => {
  const isFree = category === "free";

  const handleAction = () => {
    if (isFree && url) {
      window.open(url, "_blank");
    } else if (!isFree) {
      const message = encodeURIComponent(
        `Hello! I'm interested in purchasing the "${name}" tool for TSH ${(price || 0).toLocaleString()}. Please provide payment details.`
      );
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-lg ${
                isFree ? "bg-secondary/10 text-secondary" : "bg-accent/10 text-accent"
              }`}
            >
              {icon}
            </div>
            <div className="flex-1">
              <DialogTitle className="font-mono text-xl text-foreground">
                {name}
              </DialogTitle>
              <Badge
                variant="outline"
                className={`font-mono mt-1 ${
                  isFree
                    ? "border-secondary text-secondary"
                    : "border-accent text-accent"
                }`}
              >
                {isFree ? (
                  <span className="flex items-center gap-1">
                    <Unlock className="w-3 h-3" /> FREE
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3" /> TSH {(price || 0).toLocaleString()}
                  </span>
                )}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div>
            <h4 className="font-mono text-sm text-primary mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              About This Tool
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description || "No description available for this tool."}
            </p>
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              onClick={handleAction}
              className={`w-full font-mono transition-all ${
                isFree
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  : "bg-accent text-accent-foreground hover:bg-accent/90"
              }`}
            >
              {isFree ? (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Launch Tool
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Buy Now - TSH {(price || 0).toLocaleString()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToolDetailDialog;
