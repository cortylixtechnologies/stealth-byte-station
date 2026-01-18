import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import VideoPlayerDialog from "./VideoPlayerDialog";

interface VideoCardProps {
  title: string;
  thumbnail: string;
  duration: string;
  category: string;
  videoUrl?: string | null;
  youtubeUrl?: string | null;
}

const VideoCard = ({ 
  title, 
  thumbnail, 
  duration, 
  category,
  videoUrl,
  youtubeUrl 
}: VideoCardProps) => {
  const [showPlayer, setShowPlayer] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.02 }}
        onClick={() => setShowPlayer(true)}
        className="cyber-card border border-border overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-neon-cyan hover:border-primary"
      >
        <div className="relative aspect-video overflow-hidden">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-neon-cyan">
              <Play className="w-8 h-8 text-primary-foreground ml-1" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-background/80 px-2 py-1 rounded text-xs font-mono text-foreground">
            <Clock className="w-3 h-3" />
            {duration}
          </div>
          <Badge
            variant="outline"
            className="absolute top-2 left-2 font-mono text-xs border-primary text-primary bg-background/80"
          >
            {category}
          </Badge>
        </div>
        <div className="p-4">
          <h3 className="font-mono text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>
      </motion.div>

      <VideoPlayerDialog
        isOpen={showPlayer}
        onClose={() => setShowPlayer(false)}
        title={title}
        videoUrl={videoUrl || null}
        youtubeUrl={youtubeUrl || null}
      />
    </>
  );
};

export default VideoCard;