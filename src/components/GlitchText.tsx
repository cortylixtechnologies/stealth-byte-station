import { motion } from "framer-motion";

interface GlitchTextProps {
  text: string;
  className?: string;
}

const GlitchText = ({ text, className = "" }: GlitchTextProps) => {
  return (
    <motion.span
      className={`glitch ${className}`}
      data-text={text}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {text}
    </motion.span>
  );
};

export default GlitchText;