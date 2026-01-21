import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
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
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlitchText from "@/components/GlitchText";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const usernameSchema = z.string().min(3, "Username must be at least 3 characters").optional();

interface RateLimitStatus {
  isBlocked: boolean;
  attemptsRemaining: number;
  blockedUntil: string | null;
}

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; username?: string }>({});
  const [rateLimitStatus, setRateLimitStatus] = useState<RateLimitStatus | null>(null);

  const { signIn, signUp, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [user, isAdmin, navigate]);

  const checkRateLimit = async (emailToCheck: string): Promise<RateLimitStatus | null> => {
    try {
      const { data, error } = await supabase.functions.invoke("check-rate-limit", {
        body: { email: emailToCheck, action: "check" },
      });

      if (error) {
        console.error("Rate limit check failed:", error);
        return null;
      }

      return data as RateLimitStatus;
    } catch (err) {
      console.error("Rate limit check error:", err);
      return null;
    }
  };

  const recordLoginAttempt = async (emailToRecord: string, success: boolean) => {
    try {
      await supabase.functions.invoke("check-rate-limit", {
        body: { email: emailToRecord, action: "record", success },
      });
    } catch (err) {
      console.error("Failed to record login attempt:", err);
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; username?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (!isLogin && username) {
      const usernameResult = usernameSchema.safeParse(username);
      if (!usernameResult.success) {
        newErrors.username = usernameResult.error.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    // Check rate limit before attempting login
    const rateLimit = await checkRateLimit(email);
    if (rateLimit?.isBlocked) {
      setRateLimitStatus(rateLimit);
      const blockedUntil = rateLimit.blockedUntil 
        ? new Date(rateLimit.blockedUntil).toLocaleTimeString() 
        : "15 minutes";
      toast.error(`Too many failed attempts. Try again after ${blockedUntil}`);
      setLoading(false);
      return;
    }

    const { error } = await signIn(email, password);

    if (error) {
      // Record failed attempt
      await recordLoginAttempt(email, false);
      
      // Update rate limit status
      const updatedRateLimit = await checkRateLimit(email);
      setRateLimitStatus(updatedRateLimit);

      if (error.message.includes("Invalid login credentials")) {
        const remaining = updatedRateLimit?.attemptsRemaining ?? "few";
        toast.error(`Invalid email or password. ${remaining} attempts remaining.`);
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Please confirm your email address");
      } else {
        toast.error(error.message);
      }
    } else {
      // Record successful attempt
      await recordLoginAttempt(email, true);
      setRateLimitStatus(null);
      toast.success("Welcome back!");
    }

    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const { error } = await signUp(email, password, username);
    setLoading(false);

    if (error) {
      if (error.message.includes("User already registered")) {
        toast.error("An account with this email already exists");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Account created successfully!");
    }
  };

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
          <Tabs
            value={isLogin ? "login" : "signup"}
            onValueChange={(v) => {
              setIsLogin(v === "login");
              setErrors({});
            }}
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
                  onSubmit={handleLogin}
                >
                  {/* Rate Limit Warning */}
                  {rateLimitStatus && (rateLimitStatus.isBlocked || rateLimitStatus.attemptsRemaining <= 2) && (
                    <div className={`p-3 rounded-lg border font-mono text-sm flex items-center gap-2 ${
                      rateLimitStatus.isBlocked 
                        ? "bg-destructive/10 border-destructive/50 text-destructive" 
                        : "bg-yellow-500/10 border-yellow-500/50 text-yellow-400"
                    }`}>
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      {rateLimitStatus.isBlocked ? (
                        <span>
                          Account temporarily locked. Try again after{" "}
                          {rateLimitStatus.blockedUntil 
                            ? new Date(rateLimitStatus.blockedUntil).toLocaleTimeString()
                            : "15 minutes"}
                        </span>
                      ) : (
                        <span>
                          Warning: {rateLimitStatus.attemptsRemaining} attempt{rateLimitStatus.attemptsRemaining !== 1 ? "s" : ""} remaining
                        </span>
                      )}
                    </div>
                  )}

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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 font-mono bg-input border-border focus:border-primary focus:ring-primary"
                        disabled={rateLimitStatus?.isBlocked}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-destructive font-mono">{errors.email}</p>
                    )}
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 font-mono bg-input border-border focus:border-primary focus:ring-primary"
                        disabled={rateLimitStatus?.isBlocked}
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
                    {errors.password && (
                      <p className="text-xs text-destructive font-mono">{errors.password}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || rateLimitStatus?.isBlocked}
                    className="w-full font-mono bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon-cyan"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Terminal className="w-4 h-4 mr-2" />
                    )}
                    {loading ? "Logging in..." : rateLimitStatus?.isBlocked ? "Account Locked" : "Login"}
                  </Button>
                </motion.form>
              </TabsContent>

              <TabsContent value="signup" key="signup">
                <motion.form
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                  onSubmit={handleSignup}
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
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10 font-mono bg-input border-border focus:border-primary focus:ring-primary"
                      />
                    </div>
                    {errors.username && (
                      <p className="text-xs text-destructive font-mono">{errors.username}</p>
                    )}
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 font-mono bg-input border-border focus:border-primary focus:ring-primary"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-destructive font-mono">{errors.email}</p>
                    )}
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                    {errors.password && (
                      <p className="text-xs text-destructive font-mono">{errors.password}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full font-mono bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon-cyan"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4 mr-2" />
                    )}
                    {loading ? "Creating account..." : "Create Account"}
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
              disabled
            >
              <Chrome className="w-4 h-4 mr-2" />
              Google
            </Button>
            <Button
              variant="outline"
              className="font-mono border-border hover:border-primary hover:text-primary"
              disabled
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4 font-mono">
            Social login coming soon
          </p>
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
