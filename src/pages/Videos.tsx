import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import VideoCard from "@/components/VideoCard";
import WhatsAppButton from "@/components/WhatsAppButton";

const categories = ["All", "Hacking", "Programming", "Security Tools", "CTF"];

const videos = [
  {
    title: "Complete Ethical Hacking Course - From Zero to Hero",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800",
    duration: "4:32:15",
    category: "Hacking",
  },
  {
    title: "Python for Cybersecurity - Full Bootcamp",
    thumbnail: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800",
    duration: "3:45:00",
    category: "Programming",
  },
  {
    title: "Mastering Burp Suite for Web Application Testing",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
    duration: "1:28:45",
    category: "Security Tools",
  },
  {
    title: "Capture The Flag (CTF) - Complete Strategy Guide",
    thumbnail: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800",
    duration: "2:15:30",
    category: "CTF",
  },
  {
    title: "Network Penetration Testing Fundamentals",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
    duration: "2:45:00",
    category: "Hacking",
  },
  {
    title: "JavaScript Security - Preventing XSS Attacks",
    thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800",
    duration: "58:30",
    category: "Programming",
  },
  {
    title: "Wireshark Deep Dive - Network Traffic Analysis",
    thumbnail: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800",
    duration: "1:45:00",
    category: "Security Tools",
  },
  {
    title: "Web CTF Challenges - Step by Step Solutions",
    thumbnail: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800",
    duration: "1:32:00",
    category: "CTF",
  },
  {
    title: "SQL Injection Attacks - Complete Tutorial",
    thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800",
    duration: "1:15:45",
    category: "Hacking",
  },
  {
    title: "Bash Scripting for Security Professionals",
    thumbnail: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800",
    duration: "2:00:00",
    category: "Programming",
  },
  {
    title: "Nmap Complete Guide - Network Scanning",
    thumbnail: "https://images.unsplash.com/photo-1551808525-51a94da548ce?w=800",
    duration: "1:10:00",
    category: "Security Tools",
  },
  {
    title: "Reverse Engineering CTF Challenges",
    thumbnail: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=800",
    duration: "2:30:00",
    category: "CTF",
  },
];

const Videos = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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
      <WhatsAppButton phoneNumber="1234567890" />

      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto">
          <SectionHeader
            tag="Video Library"
            title="Tutorial Videos"
            subtitle="Learn from our comprehensive video tutorials covering hacking, programming, and security tools."
          />

          {/* Search and Categories */}
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <VideoCard {...video} />
              </motion.div>
            ))}
          </div>

          {filteredVideos.length === 0 && (
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