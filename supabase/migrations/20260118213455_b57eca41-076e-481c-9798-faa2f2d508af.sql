-- Add video_url column for directly uploaded videos
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS video_url TEXT;