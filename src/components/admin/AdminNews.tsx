import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Star } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import ImageUpload from "./ImageUpload";

interface NewsItem {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  image_url: string | null;
  author: string | null;
  is_featured: boolean;
  is_active: boolean;
  published_at: string;
  created_at: string;
}

const AdminNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    image_url: "",
    author: "",
    is_featured: false,
    is_active: true,
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("published_at", { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch news: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newsData = {
      title: formData.title,
      summary: formData.summary || null,
      content: formData.content || null,
      image_url: formData.image_url || null,
      author: formData.author || null,
      is_featured: formData.is_featured,
      is_active: formData.is_active,
    };

    try {
      if (editingNews) {
        const { error } = await supabase
          .from("news")
          .update(newsData)
          .eq("id", editingNews.id);
        
        if (error) throw error;
        toast.success("News updated successfully");
      } else {
        const { error } = await supabase.from("news").insert([newsData]);
        
        if (error) throw error;
        toast.success("News created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchNews();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news article?")) return;

    try {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
      toast.success("News deleted successfully");
      fetchNews();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const openEditDialog = (item: NewsItem) => {
    setEditingNews(item);
    setFormData({
      title: item.title,
      summary: item.summary || "",
      content: item.content || "",
      image_url: item.image_url || "",
      author: item.author || "",
      is_featured: item.is_featured,
      is_active: item.is_active,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingNews(null);
    setFormData({
      title: "",
      summary: "",
      content: "",
      image_url: "",
      author: "",
      is_featured: false,
      is_active: true,
    });
  };

  const filteredNews = news.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-mono font-bold text-foreground">
          Manage News
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="font-mono bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Add News
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-mono text-foreground">
                {editingNews ? "Edit News Article" : "Add New Article"}
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
                <Label className="font-mono">Summary</Label>
                <Textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="font-mono bg-input border-border"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-mono">Content</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="font-mono bg-input border-border"
                  rows={5}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-mono">Article Image</Label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  folder="news"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-mono">Author</Label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="font-mono bg-input border-border"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-mono">Featured</Label>
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-mono">Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <Button type="submit" className="w-full font-mono bg-primary text-primary-foreground">
                {editingNews ? "Update Article" : "Create Article"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search news..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 font-mono bg-input border-border"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground font-mono">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {filteredNews.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-mono font-semibold text-foreground">{item.title}</h3>
                  {item.is_featured && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                  {!item.is_active && (
                    <span className="px-2 py-0.5 text-xs font-mono rounded bg-destructive/20 text-destructive">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {item.summary}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-mono">
                  {item.author && <span>By {item.author}</span>}
                  <span>{format(new Date(item.published_at), "MMM d, yyyy")}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(item)}
                  className="text-primary hover:bg-primary/10"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {filteredNews.length === 0 && (
            <div className="text-center py-8 text-muted-foreground font-mono">
              No news articles found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNews;
