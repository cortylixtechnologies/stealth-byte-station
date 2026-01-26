import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewsDetailDialog from "./NewsDetailDialog";

interface NewsCardProps {
  title: string;
  summary: string;
  content?: string;
  date: string;
  author?: string | null;
  image?: string;
}

const NewsCard = ({ title, summary, content, date, author, image }: NewsCardProps) => {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -5 }}
        className="cyber-card border border-border overflow-hidden group transition-all duration-300 hover:shadow-neon-cyan hover:border-primary"
      >
        {image && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono mb-3">
            <Calendar className="w-3 h-3 text-primary" />
            <span>{date}</span>
          </div>
          <h3 className="font-mono text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {summary}
          </p>
          <Button
            onClick={() => setDetailOpen(true)}
            variant="ghost"
            className="font-mono text-primary hover:text-primary hover:bg-primary/10 p-0"
          >
            Read More <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.article>

      <NewsDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={title}
        summary={summary}
        content={content || ""}
        date={date}
        author={author}
        image={image}
      />
    </>
  );
};

export default NewsCard;