import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Wrench } from "lucide-react";
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

interface Tool {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  url: string | null;
  price: number | null;
  is_active: boolean;
  created_at: string;
}

const AdminTools = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "free",
    icon: "",
    url: "",
    price: "",
    is_active: true,
  });

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTools(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch tools: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const toolData = {
      name: formData.name,
      description: formData.description || null,
      category: formData.category,
      icon: formData.icon || null,
      url: formData.url || null,
      price: formData.price ? parseFloat(formData.price) : null,
      is_active: formData.is_active,
    };

    try {
      if (editingTool) {
        const { error } = await supabase
          .from("tools")
          .update(toolData)
          .eq("id", editingTool.id);
        
        if (error) throw error;
        toast.success("Tool updated successfully");
      } else {
        const { error } = await supabase.from("tools").insert([toolData]);
        
        if (error) throw error;
        toast.success("Tool created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchTools();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tool?")) return;

    try {
      const { error } = await supabase.from("tools").delete().eq("id", id);
      if (error) throw error;
      toast.success("Tool deleted successfully");
      fetchTools();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const openEditDialog = (tool: Tool) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      description: tool.description || "",
      category: tool.category,
      icon: tool.icon || "",
      url: tool.url || "",
      price: tool.price?.toString() || "",
      is_active: tool.is_active,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingTool(null);
    setFormData({
      name: "",
      description: "",
      category: "free",
      icon: "",
      url: "",
      price: "",
      is_active: true,
    });
  };

  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-mono font-bold text-foreground">
          Manage Tools
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="font-mono bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Tool
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-mono text-foreground">
                {editingTool ? "Edit Tool" : "Add New Tool"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="font-mono">Tool Image</Label>
                <ImageUpload
                  value={formData.icon}
                  onChange={(url) => setFormData({ ...formData, icon: url })}
                  folder="tools"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-mono">Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono">Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="font-mono bg-input border-border"
                    disabled={formData.category === "free"}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-mono">Tool URL</Label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  className="font-mono bg-input border-border"
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
                {editingTool ? "Update Tool" : "Create Tool"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search tools..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 font-mono bg-input border-border"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground font-mono">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg"
            >
              <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                {tool.icon && tool.icon.startsWith("http") ? (
                  <img
                    src={tool.icon}
                    alt={tool.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Wrench className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-mono font-semibold text-foreground">{tool.name}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs font-mono rounded ${
                      tool.category === "free"
                        ? "bg-primary/20 text-primary"
                        : "bg-accent/20 text-accent"
                    }`}
                  >
                    {tool.category}
                  </span>
                  {!tool.is_active && (
                    <span className="px-2 py-0.5 text-xs font-mono rounded bg-destructive/20 text-destructive">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{tool.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(tool)}
                  className="text-primary hover:bg-primary/10"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(tool.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {filteredTools.length === 0 && (
            <div className="text-center py-8 text-muted-foreground font-mono">
              No tools found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminTools;
