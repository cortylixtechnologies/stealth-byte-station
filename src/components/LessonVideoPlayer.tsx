import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LessonVideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoUrl: string | null;
  youtubeUrl: string | null;
}

const LessonVideoPlayer = ({
  isOpen,
  onClose,
  title,
  videoUrl,
  youtubeUrl,
}: LessonVideoPlayerProps) => {
  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
  };

  const youtubeEmbedUrl = youtubeUrl ? getYouTubeEmbedUrl(youtubeUrl) : null;

  // Check if video URL is valid
  const isValidVideoUrl = videoUrl && videoUrl.trim() !== '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 bg-background border-border">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="font-mono text-foreground">{title}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full bg-black">
          {isValidVideoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full"
              crossOrigin="anonymous"
              onError={(e) => {
                console.error("Video playback error:", e);
              }}
            >
              Your browser does not support the video tag.
            </video>
          ) : youtubeEmbedUrl ? (
            <iframe
              src={youtubeEmbedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground font-mono">
              No video available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LessonVideoPlayer;
