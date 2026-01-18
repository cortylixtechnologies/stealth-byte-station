import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Newspaper, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import NewsCard from "@/components/NewsCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface NewsArticle {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  image_url: string | null;
  author: string | null;
  published_at: string;
  is_featured: boolean;
}

const News = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("is_active", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const featuredArticle = news.find((article) => article.is_featured) || news[0];
  const otherArticles = news.filter((article) => article.id !== featuredArticle?.id);

  return (
    <div className="min-h-screen bg-background matrix-bg">
      <Navbar />
      <WhatsAppButton phoneNumber="1234567890" />

      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto">
          <SectionHeader
            tag="Cyber Intel"
            title="Latest Cyber News"
            subtitle="Stay informed with the latest cybersecurity news, threats, vulnerabilities, and industry updates."
          />

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : news.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Newspaper className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-mono">
                No news articles available yet.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Featured Article */}
              {featuredArticle && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-12"
                >
                  <div className="cyber-card border border-primary overflow-hidden shadow-neon-cyan">
                    <div className="grid md:grid-cols-2">
                      <div className="relative h-64 md:h-auto">
                        <img
                          src={featuredArticle.image_url || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800"}
                          alt={featuredArticle.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent md:bg-gradient-to-r md:from-transparent md:to-background" />
                      </div>
                      <div className="p-8 flex flex-col justify-center">
                        <span className="inline-flex items-center gap-2 text-primary font-mono text-sm mb-4">
                          <Newspaper className="w-4 h-4" />
                          FEATURED
                        </span>
                        <h3 className="font-mono text-2xl font-bold text-foreground mb-4">
                          {featuredArticle.title}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {featuredArticle.summary}
                        </p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {format(new Date(featuredArticle.published_at), "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* News Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherArticles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NewsCard
                      title={article.title}
                      summary={article.summary || ""}
                      date={format(new Date(article.published_at), "MMMM d, yyyy")}
                      image={article.image_url || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800"}
                    />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default News;
