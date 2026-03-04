import { motion } from "framer-motion";
import {
  Shield,
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
import { useLanguage } from "@/hooks/useLanguage";

const certifications = [
  {
    name: "AV/EDR Evasion – Practical Techniques",
    organization: "Red Team Leaders",
    link: "https://courses.redteamleaders.com/completion/34946a8f387eee39",
    icon: <Shield className="w-8 h-8" />,
  },
  {
    name: "OpSec & Anonymity for Red Teams",
    organization: "Red Team Leaders",
    link: "https://courses.redteamleaders.com/completion/97e9f58e53406a9e",
    icon: <Target className="w-8 h-8" />,
  },
  {
    name: "Introduction to Red Team Operation Management",
    organization: "Red Team Leaders",
    link: "https://courses.redteamleaders.com/completion/d014373fd0a589b9",
    icon: <Zap className="w-8 h-8" />,
  },
  {
    name: "Malware Analysis – Introduction v1",
    organization: "Red Team Leaders",
    link: "https://courses.redteamleaders.com/completion/ae6f18972ba40a52",
    icon: <Code className="w-8 h-8" />,
  },
];

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background matrix-bg">
      <Navbar />
      <WhatsAppButton phoneNumber="255762223306" />

      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto">
          <SectionHeader
            tag={t("about.tag")}
            title={t("about.title")}
            subtitle={t("about.subtitle")}
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
                    {t("about.role")}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("about.bio")}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Certifications */}
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <span className="font-mono text-sm text-primary mb-2 block">
                {"// "}{t("about.credentials")}
              </span>
              <h3 className="font-mono text-2xl font-bold text-foreground">
                {t("about.certifications")}
              </h3>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {certifications.map((cert, index) => (
                <motion.a
                  key={cert.name}
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <NeonCard variant={index % 2 === 0 ? "cyan" : "magenta"}>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary">
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
                </motion.a>
              ))}
            </div>
          </div>

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
                {t("about.mission")}
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {t("about.missionText")}
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
