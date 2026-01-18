import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  PlayCircle,
  FileText,
  BookOpen,
  CheckCircle,
  Circle,
  Clock,
  ArrowLeft,
  Lock,
  Loader2,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LessonVideoPlayer from "@/components/LessonVideoPlayer";
import PdfViewer from "@/components/PdfViewer";
import CertificateDialog from "@/components/CertificateDialog";

interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  level: string;
  duration: string | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  content_type: string;
  video_url: string | null;
  youtube_url: string | null;
  pdf_url: string | null;
  text_content: string | null;
  duration: string | null;
  order_index: number;
}

interface LessonProgress {
  lesson_id: string;
  is_completed: boolean;
}

interface Certificate {
  id: string;
  certificate_number: string;
  issued_at: string;
}

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<{ [moduleId: string]: Lesson[] }>({});
  const [progress, setProgress] = useState<{ [lessonId: string]: boolean }>({});
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id, user]);

  const fetchCourseData = async () => {
    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Check enrollment
      if (user) {
        const { data: enrollment } = await supabase
          .from("course_enrollments")
          .select("id")
          .eq("course_id", id)
          .eq("user_id", user.id)
          .maybeSingle();

        setIsEnrolled(!!enrollment);

        // Fetch progress
          if (enrollment) {
            const { data: progressData } = await supabase
              .from("lesson_progress")
              .select("lesson_id, is_completed")
              .eq("user_id", user.id);

            if (progressData) {
              const progressMap: { [key: string]: boolean } = {};
              progressData.forEach((p) => {
                progressMap[p.lesson_id] = p.is_completed;
              });
              setProgress(progressMap);
            }
          }

          // Fetch existing certificate
          const { data: certData } = await supabase
            .from("certificates")
            .select("id, certificate_number, issued_at")
            .eq("course_id", id)
            .eq("user_id", user.id)
            .maybeSingle();

          if (certData) {
            setCertificate(certData);
          }

          // Fetch user profile for name
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
        }

      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from("course_modules")
        .select("*")
        .eq("course_id", id)
        .eq("is_active", true)
        .order("order_index");

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

      // Expand first module by default
      if (modulesData && modulesData.length > 0) {
        setExpandedModules(new Set([modulesData[0].id]));
        // Fetch lessons for first module
        await fetchLessons(modulesData[0].id);
      }
    } catch (error: any) {
      console.error("Error fetching course:", error);
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (moduleId: string) => {
    if (lessons[moduleId]) return; // Already fetched

    const { data, error } = await supabase
      .from("course_lessons")
      .select("*")
      .eq("module_id", moduleId)
      .eq("is_active", true)
      .order("order_index");

    if (error) {
      console.error("Error fetching lessons:", error);
      return;
    }

    setLessons((prev) => ({ ...prev, [moduleId]: data || [] }));
  };

  const toggleModule = async (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
      await fetchLessons(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (!isEnrolled && !user) {
      toast.error("Please enroll in this course to access lessons");
      navigate(`/courses`);
      return;
    }
    setSelectedLesson(lesson);
    if (lesson.content_type === "video" || lesson.video_url || lesson.youtube_url) {
      setShowVideoPlayer(true);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("lesson_progress").upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          is_completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" }
      );

      if (error) throw error;

      setProgress((prev) => ({ ...prev, [lessonId]: true }));
      toast.success("Lesson marked as complete!");

      // Check if all lessons are complete
      checkCourseCompletion();
    } catch (error: any) {
      console.error("Error marking lesson complete:", error);
      toast.error("Failed to update progress");
    }
  };

  const checkCourseCompletion = async () => {
    // Get all lesson IDs for this course
    const allLessons: string[] = [];
    for (const moduleId of Object.keys(lessons)) {
      lessons[moduleId].forEach((lesson) => allLessons.push(lesson.id));
    }

    // Include the just-marked lesson in the count
    const updatedProgress = { ...progress };
    const completedCount = allLessons.filter((lessonId) => updatedProgress[lessonId]).length;
    
    if (completedCount === allLessons.length && allLessons.length > 0) {
      // Mark course as completed
      if (user && id) {
        await supabase
          .from("course_enrollments")
          .update({
            is_completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("course_id", id);

        // Check if certificate already exists
        const { data: existingCert } = await supabase
          .from("certificates")
          .select("id, certificate_number, issued_at")
          .eq("course_id", id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (!existingCert) {
          // Generate certificate
          const certificateNumber = generateCertificateNumber();
          const { data: newCert, error: certError } = await supabase
            .from("certificates")
            .insert({
              course_id: id,
              user_id: user.id,
              certificate_number: certificateNumber,
            })
            .select("id, certificate_number, issued_at")
            .single();

          if (!certError && newCert) {
            setCertificate(newCert);
            toast.success("🎉 Congratulations! You've completed this course and earned a certificate!");
            setShowCertificate(true);
          }
        } else {
          setCertificate(existingCert);
          toast.success("🎉 Congratulations! You've completed this course!");
        }
      }
    }
  };

  const generateCertificateNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `SBA-${timestamp}-${random}`;
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case "video":
        return <PlayCircle className="w-4 h-4" />;
      case "pdf":
        return <FileText className="w-4 h-4" />;
      case "text":
        return <BookOpen className="w-4 h-4" />;
      default:
        return <PlayCircle className="w-4 h-4" />;
    }
  };

  const calculateProgress = () => {
    const allLessons: string[] = [];
    for (const moduleId of Object.keys(lessons)) {
      lessons[moduleId].forEach((lesson) => allLessons.push(lesson.id));
    }
    if (allLessons.length === 0) return 0;
    const completedCount = allLessons.filter((id) => progress[id]).length;
    return Math.round((completedCount / allLessons.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-mono text-foreground">Course not found</h1>
          <Button onClick={() => navigate("/courses")} className="mt-4">
            Back to Courses
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Course Header */}
      <section className="pt-24 pb-8 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/courses")}
            className="mb-4 font-mono text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <Badge variant="outline" className="mb-4 font-mono">
                {course.level}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-mono font-bold text-foreground mb-4">
                {course.title}
              </h1>
              <p className="text-muted-foreground mb-6">{course.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-primary" />
                  {course.duration || "Self-paced"}
                </span>
                <span>{modules.length} modules</span>
              </div>
            </div>

            {isEnrolled && (
              <div className="lg:w-1/3">
                <div className="cyber-card p-6 border border-border">
                  <h3 className="font-mono text-lg font-bold text-foreground mb-4">
                    Your Progress
                  </h3>
                  <Progress value={calculateProgress()} className="h-3 mb-2" />
                  <p className="text-sm text-muted-foreground font-mono mb-4">
                    {calculateProgress()}% complete
                  </p>
                  
                  {certificate && (
                    <Button
                      onClick={() => setShowCertificate(true)}
                      className="w-full font-mono bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    >
                      <Award className="w-4 h-4 mr-2" />
                      View Certificate
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Module List */}
            <div className="lg:w-1/3">
              <div className="cyber-card border border-border sticky top-24">
                <div className="p-4 border-b border-border">
                  <h2 className="font-mono font-bold text-foreground">
                    Course Content
                  </h2>
                </div>
                <ScrollArea className="h-[60vh]">
                  <div className="p-2">
                    {modules.map((module, moduleIndex) => (
                      <div key={module.id} className="mb-2">
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            {expandedModules.has(module.id) ? (
                              <ChevronDown className="w-4 h-4 text-primary" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="font-mono text-sm text-foreground">
                              Module {moduleIndex + 1}: {module.title}
                            </span>
                          </div>
                        </button>

                        <AnimatePresence>
                          {expandedModules.has(module.id) && lessons[module.id] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-7 space-y-1 py-2">
                                {lessons[module.id].map((lesson) => (
                                  <button
                                    key={lesson.id}
                                    onClick={() => handleLessonClick(lesson)}
                                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                                      selectedLesson?.id === lesson.id
                                        ? "bg-primary/20 border border-primary/50"
                                        : "hover:bg-muted/50"
                                    }`}
                                  >
                                    <div className="flex-shrink-0">
                                      {progress[lesson.id] ? (
                                        <CheckCircle className="w-4 h-4 text-secondary" />
                                      ) : isEnrolled ? (
                                        <Circle className="w-4 h-4 text-muted-foreground" />
                                      ) : (
                                        <Lock className="w-4 h-4 text-muted-foreground" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-foreground truncate">
                                        {lesson.title}
                                      </p>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        {getContentIcon(lesson.content_type)}
                                        <span>{lesson.duration || "5 min"}</span>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:w-2/3">
              {selectedLesson ? (
                <motion.div
                  key={selectedLesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="cyber-card border border-border p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-mono font-bold text-foreground">
                      {selectedLesson.title}
                    </h2>
                    {isEnrolled && !progress[selectedLesson.id] && (
                      <Button
                        onClick={() => markLessonComplete(selectedLesson.id)}
                        variant="outline"
                        className="font-mono"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                    {progress[selectedLesson.id] && (
                      <Badge className="bg-secondary text-secondary-foreground font-mono">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>

                  {selectedLesson.description && (
                    <p className="text-muted-foreground mb-6">
                      {selectedLesson.description}
                    </p>
                  )}

                  {/* Video Content */}
                  {(selectedLesson.content_type === "video" ||
                    selectedLesson.video_url ||
                    selectedLesson.youtube_url) && (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                      {selectedLesson.video_url ? (
                        <video
                          src={selectedLesson.video_url}
                          controls
                          className="w-full h-full"
                          crossOrigin="anonymous"
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : selectedLesson.youtube_url ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${getYouTubeId(
                            selectedLesson.youtube_url
                          )}`}
                          title={selectedLesson.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No video available
                        </div>
                      )}
                    </div>
                  )}

                  {/* PDF Content */}
                  {selectedLesson.content_type === "pdf" && selectedLesson.pdf_url && (
                    <PdfViewer url={selectedLesson.pdf_url} title={selectedLesson.title} />
                  )}

                  {/* Text Content */}
                  {selectedLesson.content_type === "text" && selectedLesson.text_content && (
                    <div className="prose prose-invert max-w-none">
                      <div
                        className="text-foreground whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: selectedLesson.text_content,
                        }}
                      />
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="cyber-card border border-border p-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-mono font-bold text-foreground mb-2">
                    Select a lesson to begin
                  </h3>
                  <p className="text-muted-foreground">
                    Choose a lesson from the sidebar to start learning
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Video Player Dialog */}
      <LessonVideoPlayer
        isOpen={showVideoPlayer}
        onClose={() => setShowVideoPlayer(false)}
        title={selectedLesson?.title || ""}
        videoUrl={selectedLesson?.video_url || null}
        youtubeUrl={selectedLesson?.youtube_url || null}
      />

      {/* Certificate Dialog */}
      {certificate && course && (
        <CertificateDialog
          isOpen={showCertificate}
          onClose={() => setShowCertificate(false)}
          certificateNumber={certificate.certificate_number}
          courseName={course.title}
          userName={userName}
          issuedDate={certificate.issued_at}
        />
      )}

      <Footer />
    </div>
  );
};

// Helper function to extract YouTube video ID
const getYouTubeId = (url: string): string => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
};

export default CourseDetail;
