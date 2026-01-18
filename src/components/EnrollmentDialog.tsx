import { useState } from "react";
import { Mail, Loader2, CheckCircle, Lock, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EnrollmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  isFree: boolean;
  price: number | null;
}

const EnrollmentDialog = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  isFree,
  price,
}: EnrollmentDialogProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Sign up the user with email and password
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/courses`,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          toast.error("This email is already registered. Please login instead.");
          setLoading(false);
          return;
        }
        throw signUpError;
      }

      // Get the user ID
      const enrollUserId = authData?.user?.id;

      if (enrollUserId) {
        // Check if already enrolled
        const { data: existingEnrollment } = await supabase
          .from("course_enrollments")
          .select("id")
          .eq("course_id", courseId)
          .eq("user_id", enrollUserId)
          .maybeSingle();

        if (existingEnrollment) {
          toast.info("You're already enrolled in this course!");
          setSuccess(true);
          return;
        }

        // Create enrollment
        const { error: enrollError } = await supabase
          .from("course_enrollments")
          .insert({
            course_id: courseId,
            user_id: enrollUserId,
          });

        if (enrollError) throw enrollError;
      }

      setSuccess(true);
      toast.success("Successfully enrolled! You can now login with your credentials.");
    } catch (error: any) {
      console.error("Enrollment error:", error);
      toast.error("Enrollment failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-foreground">
            {success ? "Enrollment Successful!" : "Enroll in Course"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {success 
              ? "You have been enrolled. Check your email for login details."
              : `Enroll in "${courseTitle}"`
            }
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-secondary" />
            </div>
            <p className="text-center text-muted-foreground text-sm">
              Account created successfully! You can now <strong className="text-foreground">login</strong> with your email and password to access your course.
            </p>
            <Button onClick={handleClose} className="font-mono">
              Go to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleEnroll} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 font-mono bg-input border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-mono text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 font-mono bg-input border-border"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-mono text-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 font-mono bg-input border-border"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-muted-foreground">Course</span>
                <span className="text-sm font-mono text-foreground">{courseTitle}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-mono text-muted-foreground">Price</span>
                <span className="text-sm font-mono font-bold text-secondary">
                  {isFree ? "FREE" : `$${price?.toFixed(2)}`}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full font-mono bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account & Enroll"
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By enrolling, you create an account to access your courses.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentDialog;
