import { motion } from "framer-motion";
import { ReactNode } from "react";

interface NeonCardProps {
  children: ReactNode;
  className?: string;
  variant?: "cyan" | "green" | "magenta";
  hover?: boolean;
}

const NeonCard = ({
  children,
  className = "",
  variant = "cyan",
  hover = true,
}: NeonCardProps) => {
  const borderColors = {
    cyan: "border-primary hover:shadow-neon-cyan",
    green: "border-secondary hover:shadow-neon-green",
    magenta: "border-accent hover:shadow-neon-magenta",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { scale: 1.02, y: -5 } : {}}
      className={`cyber-card border ${borderColors[variant]} p-6 transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default NeonCard;