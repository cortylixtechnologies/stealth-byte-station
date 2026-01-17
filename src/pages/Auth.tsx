import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Shield,
  Terminal,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Github,
  Chrome,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlitchText from "@/components/GlitchText";

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<"user" | "admin">("user");

  return (
    <div className="min-h-screen bg-background matrix-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="relative">
            <Shield className="w-10 h-10 text-primary" />
            <Terminal className="w-5 h-5 text-secondary absolute -bottom-1 -right-1" />
          </div>
          <span className="font-mono font-bold text-2xl">
            <GlitchText text="CYBER" className="text-primary neon-text" />
            <span className="text-foreground">NINJA</span>
          </span>
        </Link>

        <div className="cyber-card border border-border p-8 rounded-lg shadow-neon-cyan">
          {/* User Type Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              variant="outline"
              className={`flex-1 font-mono transition-all ${
                userType === "user"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
              onClick={() => setUserType("user")}
            >
              <User className="w-4 h-4 mr-2" />
              User
            </Button>
            <Button
              variant="outline"
              className={`flex-1 font-mono transition-all ${
                userType === "admin"
                  ? "bg-accent text-accent-foreground border-accent"
                  : "border-border text-muted-foreground hover:border-accent hover:text-accent"
              }`}
              onClick={() => setUserType("admin")}
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </div>

          <Tabs
            value={isLogin ? "login" : "signup"}
            onValueChange={(v) => setIsLogin(v === "login")}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted">
              <TabsTrigger
                value="login"
                className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="login" key="login">
                <motion.form
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-mono text-sm">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="ninja@cyberninja.com"
                        className="pl-10 font-mono bg-input border-border focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-mono text-sm">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 font-mono bg-input border-border focus:border-primary focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-border"
                      />
                      <span className="text-muted-foreground">Remember me</span>
                    </label>
                    <a href="#" className="text-primary hover:underline font-mono">
                      Forgot password?
                    </a>
                  </div>

                  <Button
                    type="submit"
                    className={`w-full font-mono ${
                      userType === "admin"
                        ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-neon-magenta"
                        : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon-cyan"
                    }`}
                  >
                    <Terminal className="w-4 h-4 mr-2" />
                    {userType === "admin" ? "Admin Login" : "Login"}
                  </Button>
                </motion.form>
              </TabsContent>

              <TabsContent value="signup" key="signup">
                <motion.form
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="font-mono text-sm">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="cyber_ninja"
                        className="pl-10 font-mono bg-input border-border focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="font-mono text-sm">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="ninja@cyberninja.com"
                        className="pl-10 font-mono bg-input border-border focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-password"
                      className="font-mono text-sm"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 font-mono bg-input border-border focus:border-primary focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-mono bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon-cyan"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Create Account
                  </Button>
                </motion.form>
              </TabsContent>
            </AnimatePresence>
          </Tabs>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-mono">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="font-mono border-border hover:border-primary hover:text-primary"
            >
              <Chrome className="w-4 h-4 mr-2" />
              Google
            </Button>
            <Button
              variant="outline"
              className="font-mono border-border hover:border-primary hover:text-primary"
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-muted-foreground hover:text-primary font-mono text-sm transition-colors"
          >
            {"<"} Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;