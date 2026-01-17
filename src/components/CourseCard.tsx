import { motion } from "framer-motion";
import { Clock, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CourseCardProps {
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  students: number;
  image: string;
}

const CourseCard = ({
  title,
  description,
  level,
  duration,
  students,
  image,
}: CourseCardProps) => {
  const levelColors = {
    Beginner: "border-secondary text-secondary",
    Intermediate: "border-primary text-primary",
    Advanced: "border-accent text-accent",
  };

  return (
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
          className="w-full font-mono border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
        >
          Enroll Now
        </Button>
      </div>
    </motion.div>
  );
};

export default CourseCard;