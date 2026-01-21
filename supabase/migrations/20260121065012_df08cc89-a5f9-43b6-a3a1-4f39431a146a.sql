-- Add is_approved column to certificates table for admin approval workflow
ALTER TABLE public.certificates 
ADD COLUMN is_approved boolean NOT NULL DEFAULT false;

-- Add approved_at timestamp
ALTER TABLE public.certificates 
ADD COLUMN approved_at timestamp with time zone;

-- Add approved_by to track which admin approved
ALTER TABLE public.certificates 
ADD COLUMN approved_by uuid;