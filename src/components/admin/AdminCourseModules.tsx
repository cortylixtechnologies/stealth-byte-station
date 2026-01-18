import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, FileText, Video, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import VideoUpload from "./VideoUpload";
import PdfUpload from "./PdfUpload";

interface Course {
  id: string;
  title: string;
  category: string;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  is_active: boolean;
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
  is_active: boolean;
}

const AdminCourseModules = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<{ [moduleId: string]: Lesson[] }>({});
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Module dialog state
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    order_index: "0",
    is_active: true,
  });

  // Lesson dialog state
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<string>("");
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    content_type: "video",
    video_url: "",
    youtube_url: "",
    pdf_url: "",
    text_content: "",
    duration: "",
    order_index: "0",
    is_active: true,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchModules();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, category")
        .order("title");
      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch courses: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from("course_modules")
        .select("*")
        .eq("course_id", selectedCourse)
        .order("order_index");
      if (error) throw error;
      setModules(data || []);
      
      // Fetch lessons for all modules
      for (const module of data || []) {
        fetchLessons(module.id);
      }
    } catch (error: any) {
      toast.error("Failed to fetch modules: " + error.message);
    }
  };

  const fetchLessons = async (moduleId: string) => {
    try {
      const { data, error } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("module_id", moduleId)
        .order("order_index");
      if (error) throw error;
      setLessons((prev) => ({ ...prev, [moduleId]: data || [] }));
    } catch (error: any) {
      toast.error("Failed to fetch lessons: " + error.message);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  // Module CRUD
  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      course_id: selectedCourse,
      title: moduleForm.title,
      description: moduleForm.description || null,
      order_index: parseInt(moduleForm.order_index),
      is_active: moduleForm.is_active,
    };

    try {
      if (editingModule) {
        const { error } = await supabase
          .from("course_modules")
          .update(data)
          .eq("id", editingModule.id);
        if (error) throw error;
        toast.success("Module updated");
      } else {
        const { error } = await supabase.from("course_modules").insert([data]);
        if (error) throw error;
        toast.success("Module created");
      }
      setModuleDialogOpen(false);
      resetModuleForm();
      fetchModules();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm("Delete this module and all its lessons?")) return;
    try {
      const { error } = await supabase.from("course_modules").delete().eq("id", id);
      if (error) throw error;
      toast.success("Module deleted");
      fetchModules();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const openEditModule = (module: Module) => {
    setEditingModule(module);
    setModuleForm({
      title: module.title,
      description: module.description || "",
      order_index: module.order_index.toString(),
      is_active: module.is_active,
    });
    setModuleDialogOpen(true);
  };

  const resetModuleForm = () => {
    setEditingModule(null);
    setModuleForm({ title: "", description: "", order_index: "0", is_active: true });
  };

  // Lesson CRUD
  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      module_id: currentModuleId,
      title: lessonForm.title,
      description: lessonForm.description || null,
      content_type: lessonForm.content_type,
      video_url: lessonForm.video_url || null,
      youtube_url: lessonForm.youtube_url || null,
      pdf_url: lessonForm.pdf_url || null,
      text_content: lessonForm.text_content || null,
      duration: lessonForm.duration || null,
      order_index: parseInt(lessonForm.order_index),
      is_active: lessonForm.is_active,
    };

    try {
      if (editingLesson) {
        const { error } = await supabase
          .from("course_lessons")
          .update(data)
          .eq("id", editingLesson.id);
        if (error) throw error;
        toast.success("Lesson updated");
      } else {
        const { error } = await supabase.from("course_lessons").insert([data]);
        if (error) throw error;
        toast.success("Lesson created");
      }
      setLessonDialogOpen(false);
      resetLessonForm();
      fetchLessons(currentModuleId);
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    if (!confirm("Delete this lesson?")) return;
    try {
      const { error } = await supabase.from("course_lessons").delete().eq("id", lesson.id);
      if (error) throw error;
      toast.success("Lesson deleted");
      fetchLessons(lesson.module_id);
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const openAddLesson = (moduleId: string) => {
    setCurrentModuleId(moduleId);
    resetLessonForm();
    setLessonDialogOpen(true);
  };

  const openEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setCurrentModuleId(lesson.module_id);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || "",
      content_type: lesson.content_type,
      video_url: lesson.video_url || "",
      youtube_url: lesson.youtube_url || "",
      pdf_url: lesson.pdf_url || "",
      text_content: lesson.text_content || "",
      duration: lesson.duration || "",
      order_index: lesson.order_index.toString(),
      is_active: lesson.is_active,
    });
    setLessonDialogOpen(true);
  };

  const resetLessonForm = () => {
    setEditingLesson(null);
    setLessonForm({
      title: "",
      description: "",
      content_type: "video",
      video_url: "",
      youtube_url: "",
      pdf_url: "",
      text_content: "",
      duration: "",
      order_index: "0",
      is_active: true,
    });
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4 text-primary" />;
      case "pdf":
        return <FileText className="w-4 h-4 text-accent" />;
      default:
        return <BookOpen className="w-4 h-4 text-secondary" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-mono font-bold text-foreground">
          Course Modules & Lessons
        </h1>
      </div>

      {/* Course Selector */}
      <div className="space-y-2">
        <Label className="font-mono">Select Course</Label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="font-mono bg-input border-border max-w-md">
            <SelectValue placeholder="Choose a course to manage" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title} ({course.category.replace("-", " ")})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCourse && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-mono font-semibold text-foreground">Modules</h2>
            <Button
              onClick={() => {
                resetModuleForm();
                setModuleDialogOpen(true);
              }}
              className="font-mono bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Module
            </Button>
          </div>

          {/* Modules List */}
          <div className="space-y-3">
            {modules.map((module) => (
              <div
                key={module.id}
                className="border border-border rounded-lg overflow-hidden bg-card"
              >
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleModule(module.id)}
                >
                  {expandedModules.has(module.id) ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-foreground">
                        {module.order_index + 1}. {module.title}
                      </span>
                      {!module.is_active && (
                        <span className="px-2 py-0.5 text-xs font-mono rounded bg-destructive/20 text-destructive">
                          Inactive
                        </span>
                      )}
                    </div>
                    {module.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {module.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModule(module)}
                      className="text-primary hover:bg-primary/10"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteModule(module.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {expandedModules.has(module.id) && (
                  <div className="border-t border-border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono text-muted-foreground">
                        Lessons ({lessons[module.id]?.length || 0})
                      </span>
                      <Button
                        size="sm"
                        onClick={() => openAddLesson(module.id)}
                        className="font-mono"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Lesson
                      </Button>
                    </div>

                    {lessons[module.id]?.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 p-3 bg-card border border-border rounded-md"
                      >
                        {getContentIcon(lesson.content_type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-foreground">
                              {lesson.order_index + 1}. {lesson.title}
                            </span>
                            <span className="px-2 py-0.5 text-xs font-mono rounded bg-primary/20 text-primary">
                              {lesson.content_type}
                            </span>
                            {lesson.duration && (
                              <span className="text-xs text-muted-foreground">
                                {lesson.duration}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditLesson(lesson)}
                            className="text-primary hover:bg-primary/10 h-8 w-8"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteLesson(lesson)}
                            className="text-destructive hover:bg-destructive/10 h-8 w-8"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {(!lessons[module.id] || lessons[module.id].length === 0) && (
                      <p className="text-sm text-muted-foreground font-mono text-center py-4">
                        No lessons yet. Add your first lesson!
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {modules.length === 0 && (
              <div className="text-center py-8 text-muted-foreground font-mono">
                No modules yet. Create your first module!
              </div>
            )}
          </div>
        </>
      )}

      {/* Module Dialog */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-mono text-foreground">
              {editingModule ? "Edit Module" : "Add Module"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleModuleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-mono">Title</Label>
              <Input
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                required
                className="font-mono bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-mono">Description</Label>
              <Textarea
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                className="font-mono bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-mono">Order Index</Label>
              <Input
                type="number"
                value={moduleForm.order_index}
                onChange={(e) => setModuleForm({ ...moduleForm, order_index: e.target.value })}
                className="font-mono bg-input border-border"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-mono">Active</Label>
              <Switch
                checked={moduleForm.is_active}
                onCheckedChange={(checked) => setModuleForm({ ...moduleForm, is_active: checked })}
              />
            </div>
            <Button type="submit" className="w-full font-mono">
              {editingModule ? "Update Module" : "Create Module"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono text-foreground">
              {editingLesson ? "Edit Lesson" : "Add Lesson"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLessonSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-mono">Title</Label>
              <Input
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                required
                className="font-mono bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-mono">Description</Label>
              <Textarea
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                className="font-mono bg-input border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-mono">Content Type</Label>
                <Select
                  value={lessonForm.content_type}
                  onValueChange={(value) => setLessonForm({ ...lessonForm, content_type: value })}
                >
                  <SelectTrigger className="font-mono bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-mono">Duration</Label>
                <Input
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                  placeholder="e.g., 15 min"
                  className="font-mono bg-input border-border"
                />
              </div>
            </div>

            {lessonForm.content_type === "video" && (
              <>
                <div className="space-y-2">
                  <Label className="font-mono">Upload Video</Label>
                  <VideoUpload
                    value={lessonForm.video_url}
                    onChange={(url) => setLessonForm({ ...lessonForm, video_url: url })}
                    folder="lessons"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono">Or YouTube URL</Label>
                  <Input
                    value={lessonForm.youtube_url}
                    onChange={(e) => setLessonForm({ ...lessonForm, youtube_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="font-mono bg-input border-border"
                  />
                </div>
              </>
            )}

            {lessonForm.content_type === "pdf" && (
              <div className="space-y-2">
                <Label className="font-mono">Upload PDF</Label>
                <PdfUpload
                  value={lessonForm.pdf_url}
                  onChange={(url) => setLessonForm({ ...lessonForm, pdf_url: url })}
                  folder="lessons"
                />
              </div>
            )}

            {lessonForm.content_type === "text" && (
              <div className="space-y-2">
                <Label className="font-mono">Text Content</Label>
                <Textarea
                  value={lessonForm.text_content}
                  onChange={(e) => setLessonForm({ ...lessonForm, text_content: e.target.value })}
                  className="font-mono bg-input border-border min-h-[200px]"
                  placeholder="Enter lesson content..."
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="font-mono">Order Index</Label>
              <Input
                type="number"
                value={lessonForm.order_index}
                onChange={(e) => setLessonForm({ ...lessonForm, order_index: e.target.value })}
                className="font-mono bg-input border-border"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-mono">Active</Label>
              <Switch
                checked={lessonForm.is_active}
                onCheckedChange={(checked) => setLessonForm({ ...lessonForm, is_active: checked })}
              />
            </div>
            <Button type="submit" className="w-full font-mono">
              {editingLesson ? "Update Lesson" : "Create Lesson"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCourseModules;
