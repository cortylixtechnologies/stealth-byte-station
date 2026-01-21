-- Create login_attempts table to track failed login attempts
CREATE TABLE public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Only allow inserts via the security definer function (no direct access)
CREATE POLICY "No direct access to login_attempts"
ON public.login_attempts
FOR SELECT
USING (false);

-- Create index for faster lookups
CREATE INDEX idx_login_attempts_email_time ON public.login_attempts(email, attempted_at DESC);
CREATE INDEX idx_login_attempts_ip_time ON public.login_attempts(ip_address, attempted_at DESC);

-- Function to record login attempt (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.record_login_attempt(
  _email TEXT,
  _ip_address TEXT DEFAULT NULL,
  _success BOOLEAN DEFAULT false
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.login_attempts (email, ip_address, success)
  VALUES (LOWER(_email), _ip_address, _success);
  
  -- Clean up old attempts (older than 24 hours)
  DELETE FROM public.login_attempts 
  WHERE attempted_at < now() - interval '24 hours';
END;
$$;

-- Function to check if login is rate limited
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _email TEXT,
  _ip_address TEXT DEFAULT NULL,
  _max_attempts INTEGER DEFAULT 5,
  _window_minutes INTEGER DEFAULT 15
)
RETURNS TABLE(
  is_blocked BOOLEAN,
  attempts_remaining INTEGER,
  blocked_until TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _attempt_count INTEGER;
  _window_start TIMESTAMP WITH TIME ZONE;
  _last_attempt TIMESTAMP WITH TIME ZONE;
BEGIN
  _window_start := now() - (_window_minutes || ' minutes')::interval;
  
  -- Count failed attempts in the window (by email OR IP)
  SELECT COUNT(*), MAX(attempted_at)
  INTO _attempt_count, _last_attempt
  FROM public.login_attempts
  WHERE (LOWER(email) = LOWER(_email) OR (_ip_address IS NOT NULL AND ip_address = _ip_address))
    AND attempted_at > _window_start
    AND success = false;
  
  IF _attempt_count >= _max_attempts THEN
    RETURN QUERY SELECT 
      true AS is_blocked,
      0 AS attempts_remaining,
      (_last_attempt + (_window_minutes || ' minutes')::interval) AS blocked_until;
  ELSE
    RETURN QUERY SELECT 
      false AS is_blocked,
      (_max_attempts - _attempt_count) AS attempts_remaining,
      NULL::TIMESTAMP WITH TIME ZONE AS blocked_until;
  END IF;
END;
$$;