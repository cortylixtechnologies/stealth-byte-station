import { motion } from "framer-motion";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  tag?: string;
}

const SectionHeader = ({ title, subtitle, tag }: SectionHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-12"
    >
      {tag && (
        <span className="inline-block font-mono text-sm text-primary mb-2 tracking-wider">
          {"// "}{tag}
        </span>
      )}
      <h2 className="font-mono text-3xl md:text-4xl font-bold text-foreground mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
      )}
      <div className="flex items-center justify-center gap-2 mt-4">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
        <div className="w-2 h-2 bg-primary rotate-45" />
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
      </div>
    </motion.div>
  );
};

export default SectionHeader;