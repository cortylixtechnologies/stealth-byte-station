import { motion } from "framer-motion";
import {
  Shield,
  Award,
  Target,
  Zap,
  Users,
  Code,
  Terminal,
  CheckCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import NeonCard from "@/components/NeonCard";
import WhatsAppButton from "@/components/WhatsAppButton";

const certifications = [
  {
    name: "Certified Ethical Hacker (CEH)",
    organization: "EC-Council",
    icon: <Shield className="w-8 h-8" />,
  },
  {
    name: "Offensive Security Certified Professional (OSCP)",
    organization: "Offensive Security",
    icon: <Target className="w-8 h-8" />,
  },
  {
    name: "CompTIA Security+",
    organization: "CompTIA",
    icon: <Award className="w-8 h-8" />,
  },
  {
    name: "Certified Information Systems Security Professional (CISSP)",
    organization: "ISC²",
    icon: <Zap className="w-8 h-8" />,
  },
  {
    name: "GIAC Penetration Tester (GPEN)",
    organization: "SANS Institute",
    icon: <Code className="w-8 h-8" />,
  },
];

const skills = [
  "Penetration Testing",
  "Vulnerability Assessment",
  "Network Security",
  "Web Application Security",
  "Malware Analysis",
  "Incident Response",
  "Cryptography",
  "Cloud Security",
  "OSINT",
  "Reverse Engineering",
  "Red Team Operations",
  "Security Automation",
];

const About = () => {
  return (
    <div className="min-h-screen bg-background matrix-bg">
      <Navbar />
      <WhatsAppButton phoneNumber="15551234567" />

      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto">
          <SectionHeader
            tag="Who Am I"
            title="About CyberNinja"
            subtitle="Dedicated to empowering individuals with cybersecurity knowledge and skills."
          />

          {/* Profile Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="cyber-card border border-primary p-8 rounded-lg shadow-neon-cyan"
            >
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="relative">
                  <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary shadow-neon-cyan">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Terminal className="w-20 h-20 text-primary" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-2 bg-secondary rounded-full shadow-neon-green">
                    <CheckCircle className="w-6 h-6 text-secondary-foreground" />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h2 className="font-mono text-2xl font-bold text-foreground mb-2">
                    CyberNinja
                  </h2>
                  <p className="text-primary font-mono mb-4">
                    Security Researcher & Ethical Hacker
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    I am the Cyber Ninja, a multi-disciplinary tech professional
                    specializing in Cyber Security, Programming, and Graphic
                    Design. I build secure, resilient systems while crafting
                    visually striking, user-focused digital experiences—
                    ensuring your digital presence is both protected and
                    powerful.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-4xl mx-auto"
          >
            {[
              { value: "10+", label: "Years Experience" },
              { value: "500+", label: "Projects Completed" },
              { value: "50K+", label: "Students Trained" },
              { value: "100+", label: "Bugs Discovered" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-6 cyber-card border border-border rounded-lg"
              >
                <div className="font-mono text-3xl font-bold text-primary neon-text mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Certifications */}
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <span className="font-mono text-sm text-primary mb-2 block">
                {"// Credentials"}
              </span>
              <h3 className="font-mono text-2xl font-bold text-foreground">
                Professional Certifications
              </h3>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <NeonCard
                    variant={
                      index % 3 === 0
                        ? "cyan"
                        : index % 3 === 1
                        ? "green"
                        : "magenta"
                    }
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          index % 3 === 0
                            ? "bg-primary/10 text-primary"
                            : index % 3 === 1
                            ? "bg-secondary/10 text-secondary"
                            : "bg-accent/10 text-accent"
                        }`}
                      >
                        {cert.icon}
                      </div>
                      <div>
                        <h4 className="font-mono font-bold text-foreground mb-1">
                          {cert.name}
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {cert.organization}
                        </p>
                      </div>
                    </div>
                  </NeonCard>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <span className="font-mono text-sm text-primary mb-2 block">
                {"// Expertise"}
              </span>
              <h3 className="font-mono text-2xl font-bold text-foreground">
                Skills & Specializations
              </h3>
            </div>

            <div className="cyber-card border border-border p-8 rounded-lg">
              <div className="flex flex-wrap gap-3 justify-center">
                {skills.map((skill, index) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="px-4 py-2 font-mono text-sm border border-primary/50 text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mt-16"
          >
            <div className="cyber-card border border-accent p-8 rounded-lg shadow-neon-magenta text-center">
              <Users className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="font-mono text-xl font-bold text-foreground mb-4">
                Our Mission
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Our mission is to deliver elite offensive security solutions with
                precision and stealth. We specialize in infiltrating complex
                infrastructures to uncover hidden risks, ensuring our clients
                stay ten steps ahead of cyber criminals. We don’t just find bugs
                — we neutralize threats through the lens of a professional
                hacker.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
