import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EnrollmentDialog from "./EnrollmentDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  students: number;
  image: string;
  isFree: boolean;
  price: number | null;
}

const CourseCard = ({
  id,
  title,
  description,
  level,
  duration,
  students,
  image,
  isFree,
  price,
}: CourseCardProps) => {
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkEnrollment();
  }, [user, id]);

  const checkEnrollment = async () => {
    if (!user) {
      setIsEnrolled(false);
      return;
    }

    const { data } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("course_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    setIsEnrolled(!!data);
  };

  const levelColors = {
    Beginner: "border-secondary text-secondary",
    Intermediate: "border-primary text-primary",
    Advanced: "border-accent text-accent",
  };

  const handleButtonClick = () => {
    if (isEnrolled) {
      navigate(`/courses/${id}`);
    } else {
      setShowEnrollDialog(true);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.02 }}
        className="cyber-card border border-border overflow-hidden group transition-all duration-300 hover:shadow-neon-cyan hover:border-primary"
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <Badge
            variant="outline"
            className={`absolute top-4 right-4 font-mono ${levelColors[level]} bg-background/80`}
          >
            {level}
          </Badge>
          {isFree && (
            <Badge
              className="absolute top-4 left-4 font-mono bg-secondary text-secondary-foreground"
            >
              FREE
            </Badge>
          )}
        </div>
        <div className="p-6">
          <h3 className="font-mono text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {description}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-primary" />
              {duration}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-primary" />
              {students.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-primary" />
              {level}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={handleButtonClick}
            className={`w-full font-mono transition-all ${
              isEnrolled
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-secondary"
                : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            }`}
          >
            {isEnrolled
              ? "Continue Learning"
              : isFree
              ? "Enroll Free"
              : `Enroll - $${price?.toFixed(2)}`}
          </Button>
        </div>
      </motion.div>

      <EnrollmentDialog
        isOpen={showEnrollDialog}
        onClose={() => {
          setShowEnrollDialog(false);
          checkEnrollment();
        }}
        courseId={id}
        courseTitle={title}
        isFree={isFree}
        price={price}
      />
    </>
  );
};

export default CourseCard;
