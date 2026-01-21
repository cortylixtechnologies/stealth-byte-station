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

const MAX_FILE_SIZE = 3 * 1024 * 1024 * 1024; // ✅ 3GB

const VideoUpload = ({
  value,
  onChange,
  folder = "videos",
}: VideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ Validate file type
    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a valid video file");
      return;
    }

    // ✅ 3GB file size limit
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 3GB");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from("uploads")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("uploads").getPublicUrl(fileName);

      onChange(publicUrl);
      toast.success("Video uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
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
            className="w-full h-40 object-cover rounded-lg border bg-black"
            controls
          />
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100">
            <Button
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
            <Button size="sm" variant="destructive" onClick={handleRemove}>
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
          className="w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm">Uploading…</span>
            </>
          ) : (
            <>
              <Video className="w-8 h-8" />
              <span className="text-sm">Click to upload video</span>
              <span className="text-xs">Max 3GB</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default VideoUpload;
