import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminConfig {
  id?: string;
  admin_key: string;
  admin_email: string;
  admin_password_hash: string;
  created_at?: string;
  updated_at?: string;
}

export const useAdminConfig = () => {
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAdminConfig = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('admin_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading admin config:', error);
        return;
      }

      setAdminConfig(data);
    } catch (error) {
      console.error('Error loading admin config:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAdminConfig = async (config: Partial<AdminConfig>) => {
    try {
      if (adminConfig?.id) {
        const { error } = await (supabase as any)
          .from('admin_config')
          .update({
            ...config,
            updated_at: new Date().toISOString()
          })
          .eq('id', adminConfig.id);

        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('admin_config')
          .insert([config]);

        if (error) throw error;
      }

      await loadAdminConfig();
      toast({
        title: "Success",
        description: "Admin configuration updated successfully"
      });
    } catch (error) {
      console.error('Error updating admin config:', error);
      toast({
        title: "Error",
        description: "Failed to update admin configuration",
        variant: "destructive"
      });
    }
  };

  const checkAdminKey = async (key: string): Promise<boolean> => {
    if (!adminConfig) return key === 'admin@gmail.com'; // Default key
    return adminConfig.admin_key === key;
  };

  const verifyAdminCredentials = async (email: string, password: string): Promise<boolean> => {
    if (!adminConfig) return false;
    // Simple comparison - in production, use proper password hashing
    return adminConfig.admin_email === email && adminConfig.admin_password_hash === password;
  };

  useEffect(() => {
    loadAdminConfig();
  }, []);

  return {
    adminConfig,
    loading,
    updateAdminConfig,
    checkAdminKey,
    verifyAdminCredentials,
    loadAdminConfig
  };
};