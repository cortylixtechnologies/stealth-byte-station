import { useState } from "react";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PdfUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

const PdfUpload = ({ value, onChange, folder = "pdfs" }: PdfUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("uploads").getPublicUrl(fileName);
      onChange(data.publicUrl);
      toast.success("PDF uploaded successfully");
    } catch (error: any) {
      toast.error("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <FileText className="w-8 h-8 text-primary" />
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-sm text-primary hover:underline truncate font-mono"
          >
            View PDF
          </a>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground font-mono">
                  Click to upload PDF (max 50MB)
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
};

export default PdfUpload;
