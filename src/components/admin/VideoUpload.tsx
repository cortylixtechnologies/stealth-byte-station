import { useState, useRef } from "react";
import { Upload, X, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VideoUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

const VideoUpload = ({ value, onChange, folder = "videos" }: VideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a video file");
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size must be less than 100MB");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("uploads")
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast.success("Video uploaded successfully");
    } catch (error: any) {
      toast.error("Failed to upload video: " + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  const getVideoId = (url: string) => {
    // Extract filename from URL for display
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleUpload}
        className="hidden"
      />

      {value ? (
        <div className="relative group">
          <video
            src={value}
            className="w-full h-40 object-cover rounded-lg border border-border bg-black"
            controls
          />
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Replace
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-40 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors cursor-pointer bg-muted/30"
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              <span className="text-sm text-muted-foreground font-mono">Uploading...</span>
            </>
          ) : (
            <>
              <Video className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-mono">Click to upload video</span>
              <span className="text-xs text-muted-foreground">Max 100MB (MP4, WebM, etc.)</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default VideoUpload;
