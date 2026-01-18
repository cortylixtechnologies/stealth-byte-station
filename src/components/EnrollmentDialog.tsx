import { useState } from "react";
import { Mail, Loader2, CheckCircle } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // Check if user exists with this email
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("user_id")
        .ilike("username", email)
        .maybeSingle();

      let userId = existingUser?.user_id;

      // If no existing user, we'll create a temporary enrollment record
      // For now, we'll use the email as identifier
      if (!userId) {
        // For guest enrollment, we store email in a special way
        // First check if already enrolled with this email
        const { data: existingEnrollment } = await supabase
          .from("course_enrollments")
          .select("id")
          .eq("course_id", courseId)
          .ilike("user_id", email)
          .maybeSingle();

        if (existingEnrollment) {
          toast.error("You're already enrolled in this course!");
          setLoading(false);
          return;
        }
      }

      // For simplicity, we'll use the auth system
      // Sign up the user with the email (or log them in if exists)
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: Math.random().toString(36).slice(-12) + "Aa1!", // Generate random password
        options: {
          emailRedirectTo: `${window.location.origin}/courses`,
        },
      });

      if (signUpError && !signUpError.message.includes("already registered")) {
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
      toast.success("Successfully enrolled! Check your email for access details.");
    } catch (error: any) {
      console.error("Enrollment error:", error);
      toast.error("Enrollment failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
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
              A confirmation email has been sent to <strong className="text-foreground">{email}</strong>.
              Follow the instructions to access your course.
            </p>
            <Button onClick={handleClose} className="font-mono">
              Close
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
                  Enrolling...
                </>
              ) : (
                "Enroll Now"
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By enrolling, you'll receive course updates and access details via email.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentDialog;
