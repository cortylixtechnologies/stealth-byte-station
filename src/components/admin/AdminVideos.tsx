import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Play } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";
import VideoUpload from "./VideoUpload";

interface Video {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string | null;
  thumbnail_url: string | null;
  category: string;
  duration: string | null;
  is_active: boolean;
  created_at: string;
}

const AdminVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [videoSource, setVideoSource] = useState<"youtube" | "upload">("youtube");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtube_url: "",
    thumbnail_url: "",
    video_url: "",
    category: "hacking",
    duration: "",
    is_active: true,
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch videos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const videoData = {
      title: formData.title,
      description: formData.description || null,
      youtube_url: videoSource === "youtube" ? formData.youtube_url : formData.video_url || null,
      thumbnail_url: formData.thumbnail_url || null,
      category: formData.category,
      duration: formData.duration || null,
      is_active: formData.is_active,
    };

    try {
      if (editingVideo) {
        const { error } = await supabase
          .from("videos")
          .update(videoData)
          .eq("id", editingVideo.id);
        
        if (error) throw error;
        toast.success("Video updated successfully");
      } else {
        const { error } = await supabase.from("videos").insert([videoData]);
        
        if (error) throw error;
        toast.success("Video created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchVideos();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      const { error } = await supabase.from("videos").delete().eq("id", id);
      if (error) throw error;
      toast.success("Video deleted successfully");
      fetchVideos();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const openEditDialog = (video: Video) => {
    setEditingVideo(video);
    const isYouTube = video.youtube_url?.includes("youtube") || video.youtube_url?.includes("youtu.be");
    setVideoSource(isYouTube ? "youtube" : "upload");
    setFormData({
      title: video.title,
      description: video.description || "",
      youtube_url: isYouTube ? video.youtube_url || "" : "",
      thumbnail_url: video.thumbnail_url || "",
      video_url: !isYouTube ? video.youtube_url || "" : "",
      category: video.category,
      duration: video.duration || "",
      is_active: video.is_active,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingVideo(null);
    setVideoSource("youtube");
    setFormData({
      title: "",
      description: "",
      youtube_url: "",
      thumbnail_url: "",
      video_url: "",
      category: "hacking",
      duration: "",
      is_active: true,
    });
  };

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-mono font-bold text-foreground">
          Manage Videos
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="font-mono bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-mono text-foreground">
                {editingVideo ? "Edit Video" : "Add New Video"}
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
              
              <div className="space-y-2">
                <Label className="font-mono">Video Source</Label>
                <Tabs value={videoSource} onValueChange={(v) => setVideoSource(v as "youtube" | "upload")}>
                  <TabsList className="w-full">
                    <TabsTrigger value="youtube" className="flex-1 font-mono">YouTube URL</TabsTrigger>
                    <TabsTrigger value="upload" className="flex-1 font-mono">Upload Video</TabsTrigger>
                  </TabsList>
                  <TabsContent value="youtube" className="mt-4">
                    <Input
                      value={formData.youtube_url}
                      onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                      className="font-mono bg-input border-border"
                    />
                  </TabsContent>
                  <TabsContent value="upload" className="mt-4">
                    <VideoUpload
                      value={formData.video_url}
                      onChange={(url) => setFormData({ ...formData, video_url: url })}
                      folder="videos"
                    />
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label className="font-mono">Video Thumbnail</Label>
                <ImageUpload
                  value={formData.thumbnail_url}
                  onChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
                  folder="thumbnails"
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
                      <SelectItem value="hacking">Hacking</SelectItem>
                      <SelectItem value="programming">Programming</SelectItem>
                      <SelectItem value="security-tools">Security Tools</SelectItem>
                      <SelectItem value="ctf">CTF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono">Duration</Label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 15:30"
                    className="font-mono bg-input border-border"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-mono">Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <Button type="submit" className="w-full font-mono bg-primary text-primary-foreground">
                {editingVideo ? "Update Video" : "Create Video"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search videos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 font-mono bg-input border-border"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground font-mono">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg"
            >
              <div className="w-32 h-20 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Play className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-mono font-semibold text-foreground">{video.title}</h3>
                  <span className="px-2 py-0.5 text-xs font-mono rounded bg-primary/20 text-primary">
                    {video.category}
                  </span>
                  {!video.is_active && (
                    <span className="px-2 py-0.5 text-xs font-mono rounded bg-destructive/20 text-destructive">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {video.description}
                </p>
                {video.duration && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    Duration: {video.duration}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(video)}
                  className="text-primary hover:bg-primary/10"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(video.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {filteredVideos.length === 0 && (
            <div className="text-center py-8 text-muted-foreground font-mono">
              No videos found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminVideos;
