import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Search,
  Bug,
  Wifi,
  Key,
  Database,
  Globe,
  Terminal,
  Lock,
  Scan,
  FileSearch,
  Network,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import ToolCard from "@/components/ToolCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { supabase } from "@/integrations/supabase/client";

interface Tool {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  price: number | null;
  url: string | null;
}

const getIconComponent = (iconName: string | null, isImage: boolean = false) => {
  // Check if it's an image URL
  if (iconName && iconName.startsWith("http")) {
    return (
      <img 
        src={iconName} 
        alt="Tool icon" 
        className="w-full h-full object-cover"
      />
    );
  }
  
  const icons: { [key: string]: React.ReactNode } = {
    network: <Network className="w-6 h-6" />,
    key: <Key className="w-6 h-6" />,
    database: <Database className="w-6 h-6" />,
    wifi: <Wifi className="w-6 h-6" />,
    bug: <Bug className="w-6 h-6" />,
    scan: <Scan className="w-6 h-6" />,
    shield: <Shield className="w-6 h-6" />,
    globe: <Globe className="w-6 h-6" />,
    filesearch: <FileSearch className="w-6 h-6" />,
    lock: <Lock className="w-6 h-6" />,
    terminal: <Terminal className="w-6 h-6" />,
    search: <Search className="w-6 h-6" />,
  };
  return icons[iconName?.toLowerCase() || ""] || <Terminal className="w-6 h-6" />;
};

const Tools = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "free" | "paid">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error("Error fetching tools:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTools = tools.filter((tool) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "free" && tool.category === "free") ||
      (filter === "paid" && tool.category === "paid");
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tool.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background matrix-bg">
      <SEO 
        title="Cybersecurity Tools - Free & Paid Hacking Tools"
        description="Access powerful cybersecurity tools for penetration testing, vulnerability assessment, and network analysis. Free and premium security tools for ethical hackers."
        keywords="hacking tools, penetration testing tools, vulnerability scanner, network security tools, cybersecurity software, ethical hacking tools"
        url="https://stealth-byte-station.lovable.app/tools"
      />
      <BreadcrumbSchema 
        items={[
          { name: "Home", url: "https://stealth-byte-station.lovable.app/" },
          { name: "Tools", url: "https://stealth-byte-station.lovable.app/tools" }
        ]} 
      />
      <Navbar />
      <WhatsAppButton phoneNumber="255762223306" />

      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto">
          <SectionHeader
            tag="Security Arsenal"
            title="Cybersecurity Tools"
            subtitle="Access powerful security tools for penetration testing, vulnerability assessment, and network analysis."
          />

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-4 mb-8 max-w-2xl mx-auto"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-mono bg-input border-border focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className={`font-mono ${
                  filter === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:border-primary hover:text-primary"
                }`}
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant="outline"
                className={`font-mono ${
                  filter === "free"
                    ? "bg-secondary text-secondary-foreground border-secondary"
                    : "border-border hover:border-secondary hover:text-secondary"
                }`}
                onClick={() => setFilter("free")}
              >
                Free
              </Button>
              <Button
                variant="outline"
                className={`font-mono ${
                  filter === "paid"
                    ? "bg-accent text-accent-foreground border-accent"
                    : "border-border hover:border-accent hover:text-accent"
                }`}
                onClick={() => setFilter("paid")}
              >
                Paid
              </Button>
            </div>
          </motion.div>

          {/* Tools Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ToolCard
                    name={tool.name}
                    description={tool.description || ""}
                    category={tool.category as "free" | "paid"}
                    icon={getIconComponent(tool.icon)}
                    price={tool.price ?? 10000}
                    url={tool.url}
                    hasImage={!!(tool.icon && tool.icon.startsWith("http"))}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filteredTools.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Terminal className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-mono">
                No tools found matching your criteria.
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tools;
