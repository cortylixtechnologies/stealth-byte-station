import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Play, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import WhatsAppButton from "@/components/WhatsAppButton";
import { supabase } from "@/integrations/supabase/client";

interface Video {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  youtube_url: string | null;
  video_url?: string | null;
  duration: string | null;
  category: string;
}

/* ================= VIDEO CARD (INLINE) ================= */
interface VideoCardProps {
  title: string;
  description?: string | null;
  thumbnail: string;
  duration: string;
  category: string;
  videoUrl?: string | null;
  youtubeUrl?: string | null;
}

const VideoCard = ({
  title,
  description,
  thumbnail,
  duration,
  category,
  videoUrl,
  youtubeUrl,
}: VideoCardProps) => {
  const link = videoUrl || youtubeUrl || "#";

  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.03 }}
      className="group block bg-card border border-border rounded-lg overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="relative">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-48 object-cover"
        />

        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <Play className="w-12 h-12 text-white" />
        </div>

        <span className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded font-mono">
          {duration}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-mono font-semibold text-sm line-clamp-2">
          {title}
        </h3>

        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        <span className="inline-block text-xs font-mono text-primary">
          {category}
        </span>
      </div>
    </motion.a>
  );
};
/* ======================================================= */

const Videos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setVideos(data || []);

      const uniqueCategories = [
        ...new Set((data || []).map((v) => v.category)),
      ];
      setCategories(["All", ...uniqueCategories]);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter((video) => {
    const matchesCategory =
      selectedCategory === "All" || video.category === selectedCategory;
    const matchesSearch = video.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background matrix-bg">
      <Navbar />
      <WhatsAppButton phoneNumber="255762223306" />

      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto">
          <SectionHeader
            tag="Video Library"
            title="Tutorial Videos"
            subtitle="Learn from our comprehensive video tutorials covering hacking, programming, and security tools."
          />

          {/* Search + Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="relative max-w-md mx-auto mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-mono bg-input border-border focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  onClick={() => setSelectedCategory(category)}
                  className={`font-mono ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Videos Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <VideoCard
                    title={video.title}
                    description={video.description}
                    thumbnail={
                      video.thumbnail_url ||
                      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800"
                    }
                    duration={video.duration || "N/A"}
                    category={video.category}
                    videoUrl={video.video_url}
                    youtubeUrl={video.youtube_url}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filteredVideos.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-mono">
                No videos found matching your criteria.
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Videos;
