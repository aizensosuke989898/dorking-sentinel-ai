-- Create admin login attempts tracking table
CREATE TABLE public.admin_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  success BOOLEAN DEFAULT false,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admin to view login attempts
CREATE POLICY "Admin can view login attempts" 
ON public.admin_login_attempts 
FOR SELECT 
USING (true);

-- Create policy to allow inserting login attempts
CREATE POLICY "Allow inserting login attempts" 
ON public.admin_login_attempts 
FOR INSERT 
WITH CHECK (true);

-- Add failed_attempts_count to admin_config
ALTER TABLE public.admin_config 
ADD COLUMN failed_attempts_count INTEGER DEFAULT 0,
ADD COLUMN last_failed_attempt TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_locked BOOLEAN DEFAULT false,
ADD COLUMN secret_key TEXT DEFAULT '!@#$';

-- Create function to track login attempts
CREATE OR REPLACE FUNCTION public.track_admin_login_attempt(
  p_ip_address TEXT,
  p_user_agent TEXT DEFAULT '',
  p_success BOOLEAN DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert login attempt
  INSERT INTO public.admin_login_attempts (ip_address, user_agent, success)
  VALUES (p_ip_address, p_user_agent, p_success);
  
  -- Update admin config if failed attempt
  IF NOT p_success THEN
    UPDATE public.admin_config 
    SET 
      failed_attempts_count = COALESCE(failed_attempts_count, 0) + 1,
      last_failed_attempt = now(),
      is_locked = CASE 
        WHEN COALESCE(failed_attempts_count, 0) + 1 >= 5 THEN true 
        ELSE false 
      END
    WHERE id = (SELECT id FROM public.admin_config LIMIT 1);
  ELSE
    -- Reset on successful login
    UPDATE public.admin_config 
    SET 
      failed_attempts_count = 0,
      last_failed_attempt = NULL,
      is_locked = false
    WHERE id = (SELECT id FROM public.admin_config LIMIT 1);
  END IF;
END;
$$;