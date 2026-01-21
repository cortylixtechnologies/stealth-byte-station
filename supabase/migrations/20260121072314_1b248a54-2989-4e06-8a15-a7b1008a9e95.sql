-- Create security_logs table to track important security events
CREATE TABLE public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY "Admins can view all security logs"
ON public.security_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Only admins can insert security logs (via edge function or trigger)
CREATE POLICY "Admins can insert security logs"
ON public.security_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX idx_security_logs_created_at ON public.security_logs(created_at DESC);
CREATE INDEX idx_security_logs_user_id ON public.security_logs(user_id);
CREATE INDEX idx_security_logs_event_type ON public.security_logs(event_type);

-- Create a function to log security events (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.log_security_event(
  _user_id UUID,
  _event_type TEXT,
  _event_description TEXT,
  _ip_address TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL,
  _metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_id UUID;
BEGIN
  INSERT INTO public.security_logs (user_id, event_type, event_description, ip_address, user_agent, metadata)
  VALUES (_user_id, _event_type, _event_description, _ip_address, _user_agent, _metadata)
  RETURNING id INTO _log_id;
  
  RETURN _log_id;
END;
$$;