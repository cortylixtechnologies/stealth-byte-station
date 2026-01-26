import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Lock, Unlock, MessageCircle, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ToolDetailDialog from "./ToolDetailDialog";

interface ToolCardProps {
  name: string;
  description: string;
  category: "free" | "paid";
  icon: React.ReactNode;
  price?: number | null;
  url?: string | null;
  whatsappNumber?: string;
}

const ToolCard = ({ 
  name, 
  description, 
  category, 
  icon, 
  price, 
  url,
  whatsappNumber = "25562223306" 
}: ToolCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const isFree = category === "free";
  const shouldTruncate = description.length > 80;
  const displayDescription = expanded || !shouldTruncate 
    ? description 
    : description.slice(0, 80) + "...";

  const handleClick = () => {
    if (isFree && url) {
      window.open(url, "_blank");
    } else if (!isFree) {
      // Redirect to WhatsApp with tool purchase message
      const message = encodeURIComponent(
        `Hello! I'm interested in purchasing the "${name}" tool for $${price || 0}. Please provide payment details.`
      );
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.02, y: -5 }}
        className={`cyber-card border p-6 transition-all duration-300 ${
          isFree
            ? "border-secondary hover:shadow-neon-green"
            : "border-accent hover:shadow-neon-magenta"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-3 rounded-lg ${
              isFree ? "bg-secondary/10 text-secondary" : "bg-accent/10 text-accent"
            }`}
          >
            {icon}
          </div>
          <Badge
            variant="outline"
            className={`font-mono ${
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
                <Lock className="w-3 h-3" /> ${price || 0}
              </span>
            )}
          </Badge>
        </div>

        <h3 className="font-mono text-lg font-bold text-foreground mb-2">
          {name}
        </h3>
        
        <div className="mb-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={expanded ? "expanded" : "collapsed"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-muted-foreground text-sm"
            >
              {displayDescription}
            </motion.p>
          </AnimatePresence>
          
          {shouldTruncate && (
            <button
              onClick={() => setExpanded(!expanded)}
              className={`mt-2 text-xs font-mono flex items-center gap-1 transition-colors ${
                isFree 
                  ? "text-secondary hover:text-secondary/80" 
                  : "text-accent hover:text-accent/80"
              }`}
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Read More
                </>
              )}
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setDetailOpen(true)}
            variant="ghost"
            size="sm"
            className={`flex-1 font-mono text-xs ${
              isFree
                ? "text-secondary hover:bg-secondary/10"
                : "text-accent hover:bg-accent/10"
            }`}
          >
            <Info className="w-3 h-3 mr-1" />
            About
          </Button>
          <Button
            onClick={handleClick}
            variant="outline"
            size="sm"
            className={`flex-1 font-mono text-xs transition-all ${
              isFree
                ? "border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
                : "border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {isFree ? (
              <>
                <ExternalLink className="w-3 h-3 mr-1" />
                Use Tool
              </>
            ) : (
              <>
                <MessageCircle className="w-3 h-3 mr-1" />
                BUY
              </>
            )}
          </Button>
        </div>
      </motion.div>

      <ToolDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        name={name}
        description={description}
        category={category}
        icon={icon}
        price={price}
        url={url}
        whatsappNumber={whatsappNumber}
      />
    </>
  );
};

export default ToolCard;