import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Shield, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Tools", path: "/tools" },
  { name: "Videos", path: "/videos" },
  { name: "News", path: "/news" },
  { name: "Courses", path: "/courses" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Shield className="w-8 h-8 text-primary transition-all duration-300 group-hover:drop-shadow-[0_0_10px_hsl(var(--primary))]" />
              <Terminal className="w-4 h-4 text-secondary absolute -bottom-1 -right-1" />
            </div>
            <span className="font-mono font-bold text-xl neon-text text-primary">
              CYBERNINJA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 font-mono text-sm transition-all duration-300 rounded-md
                  ${
                    location.pathname === link.path
                      ? "text-primary neon-text bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/auth">
              <Button
                variant="outline"
                className="font-mono border-primary text-primary hover:bg-primary hover:text-primary-foreground neon-border transition-all duration-300"
              >
                [ LOGIN ]
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-primary"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 font-mono text-sm rounded-md transition-all
                    ${
                      location.pathname === link.path
                        ? "text-primary bg-primary/10 neon-text"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    }`}
                >
                  {">"} {link.name}
                </Link>
              ))}
              <Link to="/auth" onClick={() => setIsOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full mt-2 font-mono border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  [ LOGIN ]
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;