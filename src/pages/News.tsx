import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import NewsCard from "@/components/NewsCard";
import WhatsAppButton from "@/components/WhatsAppButton";

const newsArticles = [
  {
    title: "Major Data Breach Exposes 500 Million User Records",
    summary:
      "A significant cybersecurity incident has affected one of the largest social media platforms, exposing personal information of millions of users worldwide. Security experts urge immediate password changes.",
    date: "January 15, 2024",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
  },
  {
    title: "New Zero-Day Vulnerability Discovered in Popular Browser",
    summary:
      "Security researchers have identified a critical zero-day vulnerability affecting multiple browser versions. The exploit allows remote code execution and is being actively used in the wild.",
    date: "January 14, 2024",
    image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800",
  },
  {
    title: "AI-Powered Malware: The Next Generation of Cyber Threats",
    summary:
      "Cybersecurity experts warn about the emergence of artificial intelligence-powered malware that can adapt and evolve to bypass traditional security measures.",
    date: "January 13, 2024",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800",
  },
  {
    title: "Critical Infrastructure Under Attack: Power Grid Vulnerabilities",
    summary:
      "Government agencies have issued warnings about increased cyber attacks targeting power grids and other critical infrastructure systems across multiple countries.",
    date: "January 12, 2024",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
  },
  {
    title: "Ransomware Gang Dismantled in International Operation",
    summary:
      "Law enforcement agencies from multiple countries have successfully taken down one of the most prolific ransomware groups, seizing servers and arresting key members.",
    date: "January 11, 2024",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800",
  },
  {
    title: "New Cybersecurity Framework Released for Small Businesses",
    summary:
      "A comprehensive cybersecurity framework has been released to help small and medium-sized businesses protect themselves against common cyber threats and attacks.",
    date: "January 10, 2024",
    image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800",
  },
  {
    title: "Quantum Computing: Preparing for Post-Quantum Cryptography",
    summary:
      "As quantum computing advances, organizations are beginning to prepare for the transition to quantum-resistant cryptographic algorithms to protect sensitive data.",
    date: "January 9, 2024",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
  },
  {
    title: "IoT Security Standards Updated to Address New Threats",
    summary:
      "International standards bodies have released updated security guidelines for Internet of Things devices, addressing vulnerabilities that have been exploited in recent attacks.",
    date: "January 8, 2024",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800",
  },
];

const News = () => {
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

          {/* Featured Article */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="cyber-card border border-primary overflow-hidden shadow-neon-cyan">
              <div className="grid md:grid-cols-2">
                <div className="relative h-64 md:h-auto">
                  <img
                    src={newsArticles[0].image}
                    alt={newsArticles[0].title}
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
                    {newsArticles[0].title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {newsArticles[0].summary}
                  </p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {newsArticles[0].date}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* News Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsArticles.slice(1).map((article, index) => (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NewsCard {...article} />
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default News;