import { Link } from "react-router-dom";
import {
  Shield,
  Terminal,
  Github,
  Instagram,
  Mail,
  Youtube,
  Linkedin,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="relative">
                <Shield className="w-8 h-8 text-primary" />
                <Terminal className="w-4 h-4 text-secondary absolute -bottom-1 -right-1" />
              </div>
              <span className="font-mono font-bold text-xl text-primary">
                CYBERNINJA
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-mono text-primary mb-4">{"// "}{t("footer.quickLinks")}</h4>
            <ul className="space-y-2">
              {[
                { key: "nav.tools", path: "/tools" },
                { key: "nav.videos", path: "/videos" },
                { key: "nav.news", path: "/news" },
                { key: "nav.courses", path: "/courses" },
              ].map((item) => (
                <li key={item.key}>
                  <Link
                    to={item.path}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {">"} {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-mono text-primary mb-4">{"// "}{t("footer.resources")}</h4>
            <ul className="space-y-2">
              {[
                { key: "nav.about", path: "/about" },
                { key: "nav.contact", path: "/contact" },
                { key: "footer.privacyPolicy", path: "/privacy-policy" },
                { key: "footer.termsOfService", path: "/terms-of-service" },
              ].map((item) => (
                <li key={item.key}>
                  <Link
                    to={item.path}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {">"} {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-mono text-primary mb-4">{"// "}{t("footer.connect")}</h4>
            <div className="flex flex-wrap gap-4">
              <a href="https://github.com/CyberNinja-Tz" target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/cyberninja200/" target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.youtube.com/@nobodyerror-q7w2n" target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/in/cyber-ninja-3a8534399/" target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:nobodyerror255@gmail.com" className="p-2 bg-muted rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm font-mono">
            © {new Date().getFullYear()} CYBERNINJA. {t("footer.rights")}
          </p>
          <p className="text-primary/50 text-xs font-mono mt-2">
            {"< "}{t("footer.securingFrontier")}{" />"}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
