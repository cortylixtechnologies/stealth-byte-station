import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Lock, Unlock, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PaymentDialog from "./PaymentDialog";

interface ToolCardProps {
  name: string;
  description: string;
  category: "free" | "paid";
  icon: React.ReactNode;
  price?: number | null;
  url?: string | null;
}

const ToolCard = ({ name, description, category, icon, price, url }: ToolCardProps) => {
  const isFree = category === "free";
  const [showPayment, setShowPayment] = useState(false);

  const handleClick = () => {
    if (isFree && url) {
      window.open(url, "_blank");
    } else if (!isFree) {
      setShowPayment(true);
    }
  };

  return (
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
      <p className="text-muted-foreground text-sm mb-4">{description}</p>

      <Button
        onClick={handleClick}
        variant="outline"
        className={`w-full font-mono transition-all ${
          isFree
            ? "border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
            : "border-accent text-accent hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        {isFree ? (
          <>
            <ExternalLink className="w-4 h-4 mr-2" />
            Use Tool
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy Now
          </>
        )}
      </Button>

      <PaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        toolName={name}
        price={price || 0}
      />
    </motion.div>
  );
};

export default ToolCard;