import { Link } from "react-router-dom";
import { Shield, Terminal, Github, Instagram, Facebook, Mail } from "lucide-react";

const Footer = () => {
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
              Your gateway to the cyber world. Learn, explore, and master cybersecurity.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-mono text-primary mb-4">{"// Quick Links"}</h4>
            <ul className="space-y-2">
              {["Tools", "Videos", "News", "Courses"].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase()}`}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {">"} {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-mono text-primary mb-4">{"// Resources"}</h4>
            <ul className="space-y-2">
              {["About", "Contact", "Privacy Policy", "Terms of Service"].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase().replace(" ", "-")}`}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {">"} {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-mono text-primary mb-4">{"// Connect"}</h4>
            <div className="flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-muted rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-muted rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-muted rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@cyberninja.com"
                className="p-2 bg-muted rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm font-mono">
            © {new Date().getFullYear()} CYBERNINJA. All rights reserved.
          </p>
          <p className="text-primary/50 text-xs font-mono mt-2">
            {"< Securing the digital frontier />"}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;