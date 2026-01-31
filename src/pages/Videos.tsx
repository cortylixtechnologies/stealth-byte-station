import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Play, Loader2, X } from "lucide-react";
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

const Videos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [expanded, setExpanded] = useState(false);

  // New state for Read More / Read Less
  const [showFullDescription, setShowFullDescription] = useState(false);

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

      const uniqueCategories = [...new Set((data || []).map((v) => v.category))];
      setCategories(["All", ...uniqueCategories]);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesCategory =
        selectedCategory === "All" || video.category === selectedCategory;
      const matchesSearch = video.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [videos, searchQuery, selectedCategory]);

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

          {/* Search and Categories */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
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
                  className={`font-mono ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary hover:text-primary"
                  }`}
                  onClick={() => setSelectedCategory(category)}
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
              {filteredVideos.map((video) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => {
                    setActiveVideo(video);
                    setShowFullDescription(false); // reset description toggle
                  }}
                  className="cursor-pointer bg-card border border-border rounded-lg overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={video.thumbnail_url || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800"}
                      className="w-full h-48 object-cover"
                      alt={video.title}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-mono text-sm font-semibold line-clamp-2">{video.title}</h3>
                    <span className="text-xs text-primary font-mono">{video.category}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filteredVideos.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-mono">No videos found matching your criteria.</p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />

      {/* ================= VIDEO MODAL ================= */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-auto"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-background max-w-3xl w-full rounded-lg overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="font-mono font-semibold text-sm">{activeVideo.title}</h2>
                <Button variant="ghost" size="icon" onClick={() => setActiveVideo(null)}>
                  <X />
                </Button>
              </div>

              {/* Player */}
              <div className="aspect-video bg-black">
                {activeVideo.youtube_url ? (
                  <iframe
                    src={activeVideo.youtube_url.replace("watch?v=", "embed/")}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <video src={activeVideo.video_url || ""} controls className="w-full h-full" />
                )}
              </div>

              {/* Description with Read More / Read Less */}
              {activeVideo.description && (
                <div className="p-4 max-h-[40vh] overflow-y-auto space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {showFullDescription
                      ? activeVideo.description
                      : activeVideo.description.length > 200
                      ? `${activeVideo.description.slice(0, 200)}...`
                      : activeVideo.description}
                  </p>

                  {activeVideo.description.length > 200 && (
                    <button
                      className="text-primary font-mono text-sm mt-1 hover:underline"
                      onClick={() => setShowFullDescription(!showFullDescription)}
                    >
                      {showFullDescription ? "Read Less" : "Read More"}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* =============================================== */}
    </div>
  );
};

export default Videos;
