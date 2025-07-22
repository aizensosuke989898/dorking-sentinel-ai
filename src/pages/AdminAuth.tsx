import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Key, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAdminConfig } from '@/hooks/useAdminConfig';

const AdminAuth = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showSecretInput, setShowSecretInput] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { adminConfig, trackLoginAttempt, resetFailedAttempts, loading: configLoading } = useAdminConfig();

  useEffect(() => {
    // Check if admin panel is locked
    if (adminConfig?.is_locked) {
      setShowSecretInput(true);
    }
  }, [adminConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!adminConfig) {
        throw new Error('Admin configuration not found');
      }

      // Check if admin is locked and secret key is required
      if (adminConfig.is_locked && !showSecretInput) {
        setShowSecretInput(true);
        toast({
          title: 'Account Locked',
          description: 'Too many failed attempts. Please enter the secret key.',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      // Verify secret key if required
      if (showSecretInput) {
        if (secretKey !== adminConfig.secret_key) {
          await trackLoginAttempt(false);
          toast({
            title: 'Invalid Secret Key',
            description: 'The secret key is incorrect.',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }
        // Reset failed attempts and unlock account
        await resetFailedAttempts();
        
        // Set bypass flag and redirect to dashboard immediately
        sessionStorage.setItem("adminBypass", "true");
        localStorage.setItem('isOwner', 'true');
        localStorage.setItem('adminAuthenticated', new Date().toISOString());
        
        toast({
          title: 'Admin Access Granted',
          description: 'Secret key verified. Redirecting to admin dashboard.',
        });

        navigate('/admin-dashboard');
        setLoading(false);
        return;
      }

      // Verify admin credentials
      const emailMatch = formData.email === adminConfig.admin_email;
      const passwordMatch = btoa(formData.password) === adminConfig.admin_password_hash;

      if (emailMatch && passwordMatch) {
        // Successful login
        await trackLoginAttempt(true);
        
        localStorage.setItem('isOwner', 'true');
        localStorage.setItem('adminAuthenticated', new Date().toISOString());
        
        toast({
          title: 'Admin Access Granted',
          description: 'Welcome to the admin dashboard.',
        });

        navigate('/admin-dashboard');
      } else {
        // Failed login
        await trackLoginAttempt(false);
        
        toast({
          title: 'Invalid Credentials',
          description: 'The admin credentials are incorrect.',
          variant: 'destructive'
        });

        // Check if we should show secret input after failed attempts
        if (adminConfig.failed_attempts_count >= 4) {
          setShowSecretInput(true);
        }
      }
    } catch (error) {
      console.error('Admin auth error:', error);
      toast({
        title: 'Authentication Error',
        description: 'An error occurred during authentication.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSecretSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!adminConfig) {
        throw new Error('Admin configuration not found');
      }

      if (secretKey === adminConfig.secret_key) {
        await resetFailedAttempts();
        setShowSecretInput(false);
        toast({
          title: 'Secret Key Verified',
          description: 'Account unlocked. Please enter your admin credentials.',
        });
      } else {
        toast({
          title: 'Invalid Secret Key',
          description: 'The secret key is incorrect.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Secret key verification error:', error);
      toast({
        title: 'Verification Error',
        description: 'An error occurred during secret key verification.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (configLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-4"
          >
            <div className="bg-red-600 p-3 rounded-full">
              <Key className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {showSecretInput ? 'Secret Key Required' : 'Admin Login'}
          </h1>
          <p className="text-gray-400">
            {showSecretInput 
              ? 'Account locked. Enter the secret key to unlock.'
              : 'Enter your admin credentials to access the dashboard'
            }
          </p>
          {adminConfig?.failed_attempts_count > 0 && !showSecretInput && (
            <p className="text-red-400 text-sm mt-2">
              Failed attempts: {adminConfig.failed_attempts_count}/5
            </p>
          )}
        </div>

        <Card className="bg-slate-800/50 border-slate-700 p-8">
          {showSecretInput ? (
            <form onSubmit={handleSecretSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="secretKey" className="text-white flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>Secret Key</span>
                </Label>
                <Input
                  id="secretKey"
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter the secret key"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Secret Key'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Admin Email</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter your admin email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Admin Password</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter your admin password"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Access Admin Dashboard'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="text-gray-400 hover:text-gray-300 text-sm flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </button>
          </div>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 bg-red-900/20 border border-red-600/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-red-200 text-sm">
                <strong>Security Notice:</strong> This is a restricted admin area. All access attempts are monitored.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAuth;