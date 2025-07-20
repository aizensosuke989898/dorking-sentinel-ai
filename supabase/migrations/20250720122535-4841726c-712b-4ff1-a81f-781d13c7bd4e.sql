-- Create admin_config table
CREATE TABLE public.admin_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL DEFAULT 'admin@gmail.com',
  admin_password_hash TEXT NOT NULL DEFAULT '',
  admin_key TEXT NOT NULL DEFAULT 'admin@gmail.com',
  secret_key TEXT NOT NULL DEFAULT '!@#$',
  failed_attempts_count INTEGER DEFAULT 0,
  last_failed_attempt TIMESTAMP WITH TIME ZONE,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin login attempts tracking table  
CREATE TABLE public.admin_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  success BOOLEAN DEFAULT false,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scan_logs table
CREATE TABLE public.scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_domain TEXT NOT NULL,
  scan_type TEXT NOT NULL,
  results JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create login_history table
CREATE TABLE public.login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  login_successful BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_config (admin only)
CREATE POLICY "Admin can access admin_config" 
ON public.admin_config 
FOR ALL 
USING (true);

-- RLS Policies for admin_login_attempts
CREATE POLICY "Allow inserting login attempts" 
ON public.admin_login_attempts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can view login attempts" 
ON public.admin_login_attempts 
FOR SELECT 
USING (true);

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for scan_logs
CREATE POLICY "Users can view their own scan logs" 
ON public.scan_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scan logs" 
ON public.scan_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for login_history
CREATE POLICY "Users can view their own login history" 
ON public.login_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Allow inserting login history" 
ON public.login_history 
FOR INSERT 
WITH CHECK (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to track admin login attempts
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

-- Create function to log user login
CREATE OR REPLACE FUNCTION public.log_user_login(
  p_user_id UUID,
  p_ip_address TEXT,
  p_user_agent TEXT DEFAULT '',
  p_success BOOLEAN DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.login_history (user_id, ip_address, user_agent, login_successful)
  VALUES (p_user_id, p_ip_address, p_user_agent, p_success);
END;
$$;

-- Insert default admin config
INSERT INTO public.admin_config (admin_email, admin_key, secret_key)
VALUES ('admin@gmail.com', 'admin@gmail.com', '!@#$');

-- Create update timestamps function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_admin_config_updated_at
  BEFORE UPDATE ON public.admin_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();