import { motion } from "framer-motion";
import {
  Mail,
  MessageCircle,
  MapPin,
  Phone,
  Send,
  Github,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import NeonCard from "@/components/NeonCard";
import WhatsAppButton from "@/components/WhatsAppButton";

const contactInfo = [
  {
    icon: <Mail className="w-6 h-6" />,
    label: "Email",
    value: "nobodyerror255@gmail.com",
    href: "mailto:nobodyerror255@gmail.com",
  },
  {
    icon: <Phone className="w-6 h-6" />,
    label: "Phone",
    value: "+255762223306",
    href: "tel:+255762223306",
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    label: "WhatsApp",
    value: "+255762223306",
    href: "https://wa.me/255762223306",
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    label: "Location",
    value: "Cyber City, Digital World",
    href: "#",
  },
];

const socialLinks = [
  {
    icon: <Github className="w-6 h-6" />,
    label: "GitHub",
    href: "https://github.com/CyberNinja-Tz",
    color: "hover:text-foreground hover:border-foreground",
  },
  {
    icon: <Instagram className="w-6 h-6" />,
    label: "Instagram",
    href: "https://www.instagram.com/cyberninja200/",
    color: "hover:text-[#E4405F] hover:border-[#E4405F]",
  },
  {
    icon: <Youtube className="w-6 h-6" />,
    label: "YouTube",
    href: "https://www.youtube.com/@nobodyerror-q7w2n",
    color: "hover:text-[#FF0000] hover:border-[#FF0000]",
  },
  {
    icon: <Linkedin className="w-6 h-6" />,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/cyber-ninja-3a8534399/",
    color: "hover:text-[#0A66C2] hover:border-[#0A66C2]",
  },
];

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic will be added later
  };

  return (
    <div className="min-h-screen bg-background matrix-bg">
      <Navbar />
      <WhatsAppButton phoneNumber="255762223306" />

      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto">
          <SectionHeader
            tag="Get in Touch"
            title="Contact Us"
            subtitle="Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible."
          />

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <NeonCard variant="cyan">
                <h3 className="font-mono text-xl font-bold text-foreground mb-6">
                  {"// Send a Message"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-mono text-sm">
                        Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-mono text-sm">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="font-mono text-sm">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      placeholder="How can we help?"
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="font-mono text-sm">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Your message..."
                      rows={5}
                      className="font-mono resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-mono bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon-cyan"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </NeonCard>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <NeonCard variant="green">
                <h3 className="font-mono text-xl font-bold text-foreground mb-6">
                  {"// Contact Info"}
                </h3>
                <div className="space-y-4">
                  {contactInfo.map((info) => (
                    <a
                      key={info.label}
                      href={info.href}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/10 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                        {info.icon}
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-mono">
                          {info.label}
                        </p>
                        <p className="text-foreground">{info.value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </NeonCard>

              <NeonCard variant="magenta">
                <h3 className="font-mono text-xl font-bold text-foreground mb-6">
                  {"// Follow Us"}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 p-4 rounded-lg border border-border transition-all duration-300 ${social.color}`}
                    >
                      {social.icon}
                      <span className="font-mono text-sm">
                        {social.label}
                      </span>
                    </a>
                  ))}
                </div>
              </NeonCard>

              {/* Quick WhatsApp */}
              <motion.a
                href="https://wa.me/15551234567?text=Hello! I'm interested in your services."
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                className="block cyber-card border border-[#25D366] p-6 rounded-lg hover:shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-[#25D366] text-white">
                    <MessageCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-mono font-bold text-foreground">
                      Quick WhatsApp Chat
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Click to start a conversation instantly
                    </p>
                  </div>
                </div>
              </motion.a>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
