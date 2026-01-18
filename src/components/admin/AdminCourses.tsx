import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import ImageUpload from "./ImageUpload";

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
  is_active: boolean;
  created_at: string;
}

const AdminCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "cyber-security",
    level: "beginner",
    duration: "",
    lessons_count: "",
    image_url: "",
    price: "",
    is_free: true,
    is_active: true,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch courses: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const courseData = {
      title: formData.title,
      description: formData.description || null,
      category: formData.category,
      level: formData.level,
      duration: formData.duration || null,
      lessons_count: formData.lessons_count ? parseInt(formData.lessons_count) : null,
      image_url: formData.image_url || null,
      price: formData.price ? parseFloat(formData.price) : null,
      is_free: formData.is_free,
      is_active: formData.is_active,
    };

    try {
      if (editingCourse) {
        const { error } = await supabase
          .from("courses")
          .update(courseData)
          .eq("id", editingCourse.id);
        
        if (error) throw error;
        toast.success("Course updated successfully");
      } else {
        const { error } = await supabase.from("courses").insert([courseData]);
        
        if (error) throw error;
        toast.success("Course created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCourses();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || "",
      category: course.category,
      level: course.level,
      duration: course.duration || "",
      lessons_count: course.lessons_count?.toString() || "",
      image_url: course.image_url || "",
      price: course.price?.toString() || "",
      is_free: course.is_free,
      is_active: course.is_active,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCourse(null);
    setFormData({
      title: "",
      description: "",
      category: "cyber-security",
      level: "beginner",
      duration: "",
      lessons_count: "",
      image_url: "",
      price: "",
      is_free: true,
      is_active: true,
    });
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-500/20 text-green-400";
      case "intermediate":
        return "bg-yellow-500/20 text-yellow-400";
      case "advanced":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-primary/20 text-primary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-mono font-bold text-foreground">
          Manage Courses
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="font-mono bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-mono text-foreground">
                {editingCourse ? "Edit Course" : "Add New Course"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="font-mono">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="font-mono bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-mono">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="font-mono bg-input border-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-mono">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="font-mono bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cyber-security">Cyber Security</SelectItem>
                      <SelectItem value="programming">Programming</SelectItem>
                      <SelectItem value="graphic-design">Graphic Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono">Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => setFormData({ ...formData, level: value })}
                  >
                    <SelectTrigger className="font-mono bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-mono">Duration</Label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 8 hours"
                    className="font-mono bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono">Lessons Count</Label>
                  <Input
                    type="number"
                    value={formData.lessons_count}
                    onChange={(e) => setFormData({ ...formData, lessons_count: e.target.value })}
                    className="font-mono bg-input border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-mono">Course Image</Label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  folder="courses"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-mono">Free Course</Label>
                <Switch
                  checked={formData.is_free}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
                />
              </div>
              {!formData.is_free && (
                <div className="space-y-2">
                  <Label className="font-mono">Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="font-mono bg-input border-border"
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label className="font-mono">Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <Button type="submit" className="w-full font-mono bg-primary text-primary-foreground">
                {editingCourse ? "Update Course" : "Create Course"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 font-mono bg-input border-border"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground font-mono">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg"
            >
              <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                {course.image_url ? (
                  <img
                    src={course.image_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <GraduationCap className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-mono font-semibold text-foreground">{course.title}</h3>
                  <span className={`px-2 py-0.5 text-xs font-mono rounded ${getLevelBadgeColor(course.level)}`}>
                    {course.level}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-mono rounded bg-secondary/20 text-secondary">
                    {course.category.replace("-", " ")}
                  </span>
                  {course.is_free ? (
                    <span className="px-2 py-0.5 text-xs font-mono rounded bg-primary/20 text-primary">
                      Free
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs font-mono rounded bg-accent/20 text-accent">
                      ${course.price}
                    </span>
                  )}
                  {!course.is_active && (
                    <span className="px-2 py-0.5 text-xs font-mono rounded bg-destructive/20 text-destructive">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {course.description}
                </p>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground font-mono">
                  {course.duration && <span>{course.duration}</span>}
                  {course.lessons_count && <span>{course.lessons_count} lessons</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(course)}
                  className="text-primary hover:bg-primary/10"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(course.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {filteredCourses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground font-mono">
              No courses found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
