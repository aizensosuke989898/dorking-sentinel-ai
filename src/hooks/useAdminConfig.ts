import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminConfig {
  id: string;
  admin_email: string;
  admin_password_hash: string;
  admin_key: string;
  secret_key: string;
  failed_attempts_count: number;
  last_failed_attempt: string | null;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

export const useAdminConfig = () => {
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAdminConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_config')
        .select('*')
        .single();

      if (error) {
        console.error('Error loading admin config:', error);
        return;
      }

      if (data) {
        setAdminConfig(data);
      }
    } catch (error) {
      console.error('Error in loadAdminConfig:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAdminConfig = async (config: Partial<AdminConfig>) => {
    try {
      if (adminConfig?.id) {
        const { data, error } = await supabase
          .from('admin_config')
          .update({
            ...config,
            updated_at: new Date().toISOString()
          })
          .eq('id', adminConfig.id)
          .select()
          .single();

        if (error) throw error;
        
        if (data) {
          setAdminConfig(data);
        }
      } else {
        const { data, error } = await supabase
          .from('admin_config')
          .insert([config])
          .select()
          .single();

        if (error) throw error;
        
        if (data) {
          setAdminConfig(data);
        }
      }
    } catch (error) {
      console.error('Error updating admin config:', error);
      throw error;
    }
  };

  const trackLoginAttempt = async (success: boolean, ipAddress?: string, userAgent?: string) => {
    try {
      await supabase.rpc('track_admin_login_attempt', {
        p_ip_address: ipAddress || 'unknown',
        p_user_agent: userAgent || navigator.userAgent,
        p_success: success
      });
      
      // Reload config to get updated attempt counts
      await loadAdminConfig();
    } catch (error) {
      console.error('Error tracking login attempt:', error);
    }
  };

  const resetFailedAttempts = async () => {
    try {
      await updateAdminConfig({
        failed_attempts_count: 0,
        last_failed_attempt: null,
        is_locked: false
      });
    } catch (error) {
      console.error('Error resetting failed attempts:', error);
    }
  };

  useEffect(() => {
    loadAdminConfig();
  }, []);

  return {
    adminConfig,
    loading,
    updateAdminConfig,
    trackLoginAttempt,
    resetFailedAttempts,
    loadAdminConfig
  };
};