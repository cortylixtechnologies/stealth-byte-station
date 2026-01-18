import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Code, Palette, ArrowRight, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import CourseCard from "@/components/CourseCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
  level: string;
  duration: string | null;
  lessons_count: number | null;
  image_url: string | null;
  price: number | null;
  is_free: boolean;
}

type CategoryType = "all" | "cyber-security" | "programming" | "design";

const courseCategories = [
  {
    id: "cyber-security" as const,
    name: "Cyber Security",
    icon: <Shield className="w-8 h-8" />,
    description: "Master ethical hacking, penetration testing, and security analysis.",
    color: "primary",
  },
  {
    id: "programming" as const,
    name: "Programming",
    icon: <Code className="w-8 h-8" />,
    description: "Learn coding from basics to advanced security programming.",
    color: "secondary",
  },
  {
    id: "design" as const,
    name: "Graphic Design",
    icon: <Palette className="w-8 h-8" />,
    description: "Create stunning visuals for security awareness and branding.",
    color: "accent",
  },
];

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return {
          bg: "bg-primary/10",
          text: "text-primary",
          border: "border-primary hover:shadow-neon-cyan",
        };
      case "secondary":
        return {
          bg: "bg-secondary/10",
          text: "text-secondary",
          border: "border-secondary hover:shadow-neon-green",
        };
      case "accent":
        return {
          bg: "bg-accent/10",
          text: "text-accent",
          border: "border-accent hover:shadow-neon-magenta",
        };
      default:
        return {
          bg: "bg-primary/10",
          text: "text-primary",
          border: "border-primary hover:shadow-neon-cyan",
        };
    }
  };

  const displayedCourses =
    selectedCategory === "all"
      ? courses
      : courses.filter((course) => course.category === selectedCategory);

  const mapLevelToType = (level: string): "Beginner" | "Intermediate" | "Advanced" => {
    const normalizedLevel = level.toLowerCase();
    if (normalizedLevel === "beginner") return "Beginner";
    if (normalizedLevel === "intermediate") return "Intermediate";
    if (normalizedLevel === "advanced") return "Advanced";
    return "Beginner";
  };

  return (
    <div className="min-h-screen bg-background matrix-bg">
      <Navbar />
      <WhatsAppButton phoneNumber="1234567890" />

      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto">
          <SectionHeader
            tag="Learning Hub"
            title="Master New Skills"
            subtitle="Choose your path and start learning from industry experts."
          />

          {/* Category Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {courseCategories.map((category, index) => {
              const colors = getColorClasses(category.color);
              const isSelected = selectedCategory === category.id;

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() =>
                    setSelectedCategory(isSelected ? "all" : category.id)
                  }
                  className={`cyber-card border p-6 cursor-pointer transition-all duration-300 ${
                    colors.border
                  } ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                >
                  <div className={`p-3 rounded-lg w-fit mb-4 ${colors.bg} ${colors.text}`}>
                    {category.icon}
                  </div>
                  <h3 className="font-mono text-xl font-bold text-foreground mb-2">
                    {category.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {category.description}
                  </p>
                  <Button
                    variant="ghost"
                    className={`font-mono p-0 ${colors.text}`}
                  >
                    {isSelected ? "Show All" : "Explore"}{" "}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Category Title */}
          {selectedCategory !== "all" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-8"
            >
              <h3 className="font-mono text-2xl font-bold text-foreground">
                {courseCategories.find((c) => c.id === selectedCategory)?.name}{" "}
                Courses
              </h3>
            </motion.div>
          )}

          {/* Courses Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : displayedCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-mono">
                No courses available yet.
              </p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CourseCard
                    id={course.id}
                    title={course.title}
                    description={course.description || ""}
                    level={mapLevelToType(course.level)}
                    duration={course.duration || "N/A"}
                    students={course.lessons_count || 0}
                    image={course.image_url || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800"}
                    isFree={course.is_free}
                    price={course.price}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Courses;
