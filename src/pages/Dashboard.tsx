import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Navigate } from "react-router-dom";
import {
  GraduationCap,
  Award,
  BookOpen,
  Clock,
  CheckCircle,
  ArrowRight,
  Loader2,
  Trophy,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import CertificateDialog from "@/components/CertificateDialog";

interface EnrolledCourse {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  level: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  isCompleted: boolean;
}

interface Certificate {
  id: string;
  certificate_number: string;
  issued_at: string;
  is_approved: boolean;
  course_title: string;
  course_id: string;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [userName, setUserName] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, username")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileData) {
        setUserName(profileData.full_name || profileData.username || user.email || "Student");
      } else {
        setUserName(user.email || "Student");
      }

      // Fetch enrollments
      const { data: enrollments } = await supabase
        .from("course_enrollments")
        .select("course_id, is_completed")
        .eq("user_id", user.id);

      if (enrollments && enrollments.length > 0) {
        const enrolledCourseIds = enrollments.map((e) => e.course_id);
        const enrollmentMap = new Map(enrollments.map((e) => [e.course_id, e.is_completed]));

        // Fetch course details
        const { data: coursesData } = await supabase
          .from("courses")
          .select("*")
          .in("id", enrolledCourseIds);

        // Fetch progress
        const { data: progressData } = await supabase
          .from("lesson_progress")
          .select("lesson_id, is_completed")
          .eq("user_id", user.id)
          .eq("is_completed", true);

        const completedLessons = new Set((progressData || []).map((p) => p.lesson_id));

        // Fetch modules and lessons
        const { data: modulesData } = await supabase
          .from("course_modules")
          .select("id, course_id")
          .in("course_id", enrolledCourseIds)
          .eq("is_active", true);

        const moduleIds = (modulesData || []).map((m) => m.id);

        const { data: lessonsData } = await supabase
          .from("course_lessons")
          .select("id, module_id")
          .in("module_id", moduleIds)
          .eq("is_active", true);

        // Map lessons to courses
        const lessonsByCourse: { [courseId: string]: string[] } = {};
        (lessonsData || []).forEach((lesson) => {
          const module = (modulesData || []).find((m) => m.id === lesson.module_id);
          if (module) {
            if (!lessonsByCourse[module.course_id]) {
              lessonsByCourse[module.course_id] = [];
            }
            lessonsByCourse[module.course_id].push(lesson.id);
          }
        });

        const enrichedCourses: EnrolledCourse[] = (coursesData || []).map((course) => {
          const courseLessons = lessonsByCourse[course.id] || [];
          const completedCount = courseLessons.filter((id) => completedLessons.has(id)).length;
          const totalLessons = courseLessons.length;
          const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

          return {
            id: course.id,
            title: course.title,
            description: course.description,
            image_url: course.image_url,
            level: course.level,
            progress,
            completedLessons: completedCount,
            totalLessons,
            isCompleted: enrollmentMap.get(course.id) || false,
          };
        });

        setEnrolledCourses(enrichedCourses);
      }

      // Fetch certificates
      const { data: certsData } = await supabase
        .from("certificates")
        .select("id, certificate_number, issued_at, is_approved, course_id")
        .eq("user_id", user.id);

      if (certsData && certsData.length > 0) {
        const courseIds = certsData.map((c) => c.course_id);
        const { data: coursesData } = await supabase
          .from("courses")
          .select("id, title")
          .in("id", courseIds);

        const certsWithCourses: Certificate[] = certsData.map((cert) => {
          const course = coursesData?.find((c) => c.id === cert.course_id);
          return {
            ...cert,
            course_title: course?.title || "Unknown Course",
          };
        });

        setCertificates(certsWithCourses);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const totalCourses = enrolledCourses.length;
  const completedCourses = enrolledCourses.filter((c) => c.isCompleted).length;
  const inProgressCourses = totalCourses - completedCourses;
  const approvedCertificates = certificates.filter((c) => c.is_approved).length;
  const overallProgress =
    totalCourses > 0
      ? Math.round(enrolledCourses.reduce((sum, c) => sum + c.progress, 0) / totalCourses)
      : 0;

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "border-secondary text-secondary";
      case "intermediate":
        return "border-primary text-primary";
      case "advanced":
        return "border-accent text-accent";
      default:
        return "border-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background matrix-bg">
      <Navbar />

      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-mono font-bold text-foreground mb-2">
              Welcome back, <span className="text-primary">{userName}</span>
            </h1>
            <p className="text-muted-foreground">
              Track your learning progress and achievements
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="cyber-card border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-mono text-foreground">
                        {totalCourses}
                      </p>
                      <p className="text-xs text-muted-foreground">Enrolled</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="cyber-card border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/20">
                      <Target className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-mono text-foreground">
                        {inProgressCourses}
                      </p>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="cyber-card border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/20">
                      <CheckCircle className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-mono text-foreground">
                        {completedCourses}
                      </p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="cyber-card border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/20">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-mono text-foreground">
                        {approvedCertificates}
                      </p>
                      <p className="text-xs text-muted-foreground">Certificates</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Overall Progress */}
              {totalCourses > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="cyber-card border border-border p-6 mb-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <h2 className="font-mono font-bold text-foreground">
                        Overall Progress
                      </h2>
                    </div>
                    <span className="text-2xl font-bold font-mono text-primary">
                      {overallProgress}%
                    </span>
                  </div>
                  <Progress value={overallProgress} className="h-3" />
                </motion.div>
              )}

              {/* My Courses */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-mono text-xl font-bold text-foreground flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    My Courses
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/courses")}
                    className="font-mono text-primary"
                  >
                    Browse More <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                {enrolledCourses.length === 0 ? (
                  <div className="cyber-card border border-border p-8 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      You haven't enrolled in any courses yet
                    </p>
                    <Button onClick={() => navigate("/courses")} className="font-mono">
                      Explore Courses
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {enrolledCourses.map((course) => (
                      <motion.div
                        key={course.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className={`cyber-card border p-4 cursor-pointer transition-all ${
                          course.isCompleted
                            ? "border-secondary/50 hover:shadow-neon-green"
                            : "border-border hover:shadow-neon-cyan"
                        }`}
                      >
                        <div className="flex gap-4">
                          <img
                            src={
                              course.image_url ||
                              "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200"
                            }
                            alt={course.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-mono font-bold text-foreground truncate">
                                {course.title}
                              </h3>
                              <Badge
                                variant="outline"
                                className={`text-xs shrink-0 ${getLevelColor(course.level)}`}
                              >
                                {course.level}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {course.completedLessons} of {course.totalLessons} lessons
                            </p>
                            <div className="mt-3">
                              <Progress value={course.progress} className="h-2" />
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs font-mono text-muted-foreground">
                                {course.progress}% Complete
                              </span>
                              {course.isCompleted && (
                                <Badge className="bg-secondary/20 text-secondary text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Completed
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* My Certificates */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h2 className="font-mono text-xl font-bold text-foreground flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-yellow-500" />
                  My Certificates
                </h2>

                {certificates.length === 0 ? (
                  <div className="cyber-card border border-border p-8 text-center">
                    <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Complete courses to earn certificates
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {certificates.map((cert) => (
                      <motion.div
                        key={cert.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedCertificate(cert)}
                        className={`cyber-card border p-4 cursor-pointer transition-all ${
                          cert.is_approved
                            ? "border-yellow-500/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                            : "border-accent/50"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-3 rounded-lg ${
                              cert.is_approved ? "bg-yellow-500/20" : "bg-accent/20"
                            }`}
                          >
                            <Award
                              className={`w-6 h-6 ${
                                cert.is_approved ? "text-yellow-500" : "text-accent"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-mono font-bold text-foreground truncate">
                              {cert.course_title}
                            </h3>
                            <p className="text-xs text-muted-foreground font-mono mt-1">
                              #{cert.certificate_number}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(cert.issued_at), "MMM dd, yyyy")}
                              </span>
                            </div>
                            <Badge
                              className={`mt-2 text-xs ${
                                cert.is_approved
                                  ? "bg-secondary/20 text-secondary"
                                  : "bg-accent/20 text-accent"
                              }`}
                            >
                              {cert.is_approved ? "Approved" : "Pending Approval"}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>
      </main>

      {/* Certificate Dialog */}
      {selectedCertificate && (
        <CertificateDialog
          isOpen={!!selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          certificateNumber={selectedCertificate.certificate_number}
          courseName={selectedCertificate.course_title}
          userName={userName}
          issuedDate={selectedCertificate.issued_at}
          isApproved={selectedCertificate.is_approved}
        />
      )}

      <Footer />
    </div>
  );
};

export default Dashboard;
