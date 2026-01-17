import { useState } from "react";
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import ToolCard from "@/components/ToolCard";
import WhatsAppButton from "@/components/WhatsAppButton";

const tools = [
  {
    name: "Port Scanner",
    description: "Scan networks for open ports and potential vulnerabilities.",
    category: "free" as const,
    icon: <Network className="w-6 h-6" />,
  },
  {
    name: "Password Strength Checker",
    description: "Analyze password strength and get security recommendations.",
    category: "free" as const,
    icon: <Key className="w-6 h-6" />,
  },
  {
    name: "SQL Injection Tester",
    description: "Test web applications for SQL injection vulnerabilities.",
    category: "paid" as const,
    icon: <Database className="w-6 h-6" />,
  },
  {
    name: "WiFi Security Analyzer",
    description: "Analyze WiFi network security and identify weaknesses.",
    category: "paid" as const,
    icon: <Wifi className="w-6 h-6" />,
  },
  {
    name: "Malware Scanner",
    description: "Scan files and URLs for malware and potential threats.",
    category: "free" as const,
    icon: <Bug className="w-6 h-6" />,
  },
  {
    name: "Vulnerability Scanner",
    description: "Comprehensive vulnerability assessment for web applications.",
    category: "paid" as const,
    icon: <Scan className="w-6 h-6" />,
  },
  {
    name: "SSL Certificate Checker",
    description: "Verify SSL certificates and check for security issues.",
    category: "free" as const,
    icon: <Shield className="w-6 h-6" />,
  },
  {
    name: "DNS Lookup Tool",
    description: "Perform DNS queries and analyze domain configurations.",
    category: "free" as const,
    icon: <Globe className="w-6 h-6" />,
  },
  {
    name: "Packet Analyzer",
    description: "Capture and analyze network traffic in real-time.",
    category: "paid" as const,
    icon: <FileSearch className="w-6 h-6" />,
  },
  {
    name: "Hash Generator",
    description: "Generate and verify cryptographic hashes (MD5, SHA, etc.).",
    category: "free" as const,
    icon: <Lock className="w-6 h-6" />,
  },
  {
    name: "XSS Scanner",
    description: "Detect cross-site scripting vulnerabilities in applications.",
    category: "paid" as const,
    icon: <Terminal className="w-6 h-6" />,
  },
  {
    name: "Subdomain Finder",
    description: "Discover subdomains associated with a target domain.",
    category: "free" as const,
    icon: <Search className="w-6 h-6" />,
  },
];

const Tools = () => {
  const [filter, setFilter] = useState<"all" | "free" | "paid">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = tools.filter((tool) => {
    const matchesFilter = filter === "all" || tool.category === filter;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background matrix-bg">
      <Navbar />
      <WhatsAppButton phoneNumber="1234567890" />

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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map((tool, index) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ToolCard {...tool} />
              </motion.div>
            ))}
          </div>

          {filteredTools.length === 0 && (
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