-- Update admin credentials to production values
UPDATE public.admin_config 
SET 
  admin_email = 'hcarfadmin@gmail.com',
  admin_password_hash = 'U0BQMTIzcnlh',  -- Base64 of 'S@123rya'
  secret_key = '!@#$',
  updated_at = now()
WHERE id = (SELECT id FROM public.admin_config LIMIT 1);

-- If no admin config exists, insert the production credentials
INSERT INTO public.admin_config (admin_email, admin_password_hash, admin_key, secret_key, failed_attempts_count, is_locked)
SELECT 'hcarfadmin@gmail.com', 'U0BQMTIzcnlh', 'admin@gmail.com', '!@#$', 0, false
WHERE NOT EXISTS (SELECT 1 FROM public.admin_config);