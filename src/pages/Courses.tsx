import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Code, Palette, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import CourseCard from "@/components/CourseCard";
import WhatsAppButton from "@/components/WhatsAppButton";

type CategoryType = "all" | "cybersecurity" | "programming" | "design";

const courseCategories = [
  {
    id: "cybersecurity" as const,
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

const courses = {
  cybersecurity: [
    {
      title: "Ethical Hacking Fundamentals",
      description: "Learn the basics of ethical hacking and penetration testing methodology.",
      level: "Beginner" as const,
      duration: "20 hours",
      students: 12500,
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800",
    },
    {
      title: "Advanced Penetration Testing",
      description: "Master advanced exploitation techniques and red team operations.",
      level: "Advanced" as const,
      duration: "40 hours",
      students: 5200,
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
    },
    {
      title: "Web Application Security",
      description: "Identify and exploit vulnerabilities in modern web applications.",
      level: "Intermediate" as const,
      duration: "30 hours",
      students: 8900,
      image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800",
    },
    {
      title: "Network Security Essentials",
      description: "Understand network protocols and security mechanisms.",
      level: "Beginner" as const,
      duration: "25 hours",
      students: 15000,
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
    },
  ],
  programming: [
    {
      title: "Python for Security",
      description: "Master Python programming for cybersecurity applications.",
      level: "Beginner" as const,
      duration: "35 hours",
      students: 20000,
      image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800",
    },
    {
      title: "Bash Scripting Mastery",
      description: "Automate security tasks with powerful shell scripting.",
      level: "Intermediate" as const,
      duration: "20 hours",
      students: 7500,
      image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800",
    },
    {
      title: "JavaScript Security",
      description: "Secure coding practices for JavaScript developers.",
      level: "Intermediate" as const,
      duration: "25 hours",
      students: 9800,
      image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800",
    },
    {
      title: "C/C++ for Exploits",
      description: "Low-level programming for vulnerability research and exploit development.",
      level: "Advanced" as const,
      duration: "50 hours",
      students: 3200,
      image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800",
    },
  ],
  design: [
    {
      title: "Security Awareness Design",
      description: "Create compelling visuals for security awareness campaigns.",
      level: "Beginner" as const,
      duration: "15 hours",
      students: 4500,
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
    },
    {
      title: "UI/UX for Security Tools",
      description: "Design intuitive interfaces for security applications.",
      level: "Intermediate" as const,
      duration: "25 hours",
      students: 3800,
      image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800",
    },
    {
      title: "Brand Identity for Tech",
      description: "Build powerful brand identities for cybersecurity companies.",
      level: "Intermediate" as const,
      duration: "20 hours",
      students: 2900,
      image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800",
    },
    {
      title: "Motion Graphics Basics",
      description: "Create animated content for security presentations and videos.",
      level: "Beginner" as const,
      duration: "18 hours",
      students: 5600,
      image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800",
    },
  ],
};

const Courses = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");

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
      ? [...courses.cybersecurity, ...courses.programming, ...courses.design]
      : courses[selectedCategory];

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
                    setSelectedCategory(
                      isSelected ? "all" : category.id
                    )
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedCourses.map((course, index) => (
              <motion.div
                key={course.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CourseCard {...course} />
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Courses;