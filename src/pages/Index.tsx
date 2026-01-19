import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Shield,
  Terminal,
  Code,
  Cpu,
  Lock,
  Zap,
  ArrowRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TypewriterText from "@/components/TypewriterText";
import GlitchText from "@/components/GlitchText";
import NeonCard from "@/components/NeonCard";
import WhatsAppButton from "@/components/WhatsAppButton";

const features = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Security Tools",
    description:
      "Access powerful cybersecurity tools for penetration testing and vulnerability assessment.",
    variant: "cyan" as const,
  },
  {
    icon: <Terminal className="w-8 h-8" />,
    title: "Expert Tutorials",
    description:
      "Learn from comprehensive video tutorials covering hacking, programming, and security.",
    variant: "green" as const,
  },
  {
    icon: <Code className="w-8 h-8" />,
    title: "Courses",
    description:
      "Master cybersecurity, programming, and graphic design with structured courses.",
    variant: "magenta" as const,
  },
  {
    icon: <Cpu className="w-8 h-8" />,
    title: "Latest News",
    description:
      "Stay updated with the latest cybersecurity news, threats, and industry updates.",
    variant: "cyan" as const,
  },
];

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "500+", label: "Tools Available" },
  { value: "1000+", label: "Video Tutorials" },
  { value: "50+", label: "Expert Courses" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background matrix-bg">
      <Navbar />
      <WhatsAppButton phoneNumber="255762223306" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden scanline">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-mono text-sm text-primary">
                Welcome to the cyber realm
              </span>
            </div>

            <h1 className="font-mono text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <GlitchText text="CYBER" className="text-primary neon-text" />
              <span className="text-foreground">NINJA</span>
            </h1>

            <div className="font-mono text-xl md:text-2xl text-muted-foreground mb-8 h-16">
              <TypewriterText
                text="> Unlock the secrets of cybersecurity_"
                speed={40}
                delay={500}
              />
            </div>

            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Your ultimate platform for cybersecurity tools, expert tutorials,
              and cutting-edge courses. Join thousands of security enthusiasts
              and professionals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/tools">
                <Button
                  size="lg"
                  className="font-mono bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon-cyan"
                >
                  <Terminal className="w-5 h-5 mr-2" />
                  Explore Tools
                </Button>
              </Link>
              <Link to="/courses">
                <Button
                  size="lg"
                  variant="outline"
                  className="font-mono border-primary text-primary hover:bg-primary/10"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Learning
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Terminal Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 max-w-3xl mx-auto"
          >
            <div className="cyber-card border border-primary/30 rounded-lg overflow-hidden shadow-neon-cyan">
              <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 border-b border-primary/30">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-secondary" />
                <span className="ml-2 font-mono text-sm text-muted-foreground">
                  cyberninja@terminal:~$
                </span>
              </div>
              <div className="p-6 font-mono text-sm space-y-2">
                <p className="text-secondary">
                  $ ./initialize_cyberninja.sh
                </p>
                <p className="text-muted-foreground">
                  [+] Loading security modules...
                </p>
                <p className="text-muted-foreground">
                  [+] Establishing encrypted connection...
                </p>
                <p className="text-primary">
                  [✓] Connection established. Welcome, Ninja.
                </p>
                <p className="text-muted-foreground">
                  [+] Ready to explore {">"}
                  <span className="terminal-cursor">_</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-card/50 border-y border-border">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="font-mono text-3xl md:text-4xl font-bold text-primary neon-text mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm font-mono">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="font-mono text-sm text-primary mb-2 block">
              {"// What we offer"}
            </span>
            <h2 className="font-mono text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Cyber Arsenal
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
              <div className="w-2 h-2 bg-primary rotate-45" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <NeonCard key={index} variant={feature.variant}>
                <div
                  className={`p-3 rounded-lg w-fit mb-4 ${
                    feature.variant === "cyan"
                      ? "bg-primary/10 text-primary"
                      : feature.variant === "green"
                      ? "bg-secondary/10 text-secondary"
                      : "bg-accent/10 text-accent"
                  }`}
                >
                  {feature.icon}
                </div>
                <h3 className="font-mono text-lg font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </NeonCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 cyber-gradient">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <Lock className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="font-mono text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join our community of cybersecurity professionals and enthusiasts.
              Start learning, exploring tools, and stay ahead of threats.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="font-mono bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon-cyan"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="font-mono border-primary text-primary hover:bg-primary/10"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
