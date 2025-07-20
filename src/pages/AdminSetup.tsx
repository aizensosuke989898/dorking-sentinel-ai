import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, AlertTriangle, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAdminConfig } from '@/hooks/useAdminConfig';

const AdminSetup = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    newEmail: '',
    newPassword: '',
    confirmPassword: '',
    adminKey: '',
    secretKey: ''
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { adminConfig, updateAdminConfig, trackLoginAttempt } = useAdminConfig();

  useEffect(() => {
    // Check if admin already has valid credentials
    if (adminConfig?.admin_password_hash && adminConfig?.admin_password_hash !== '') {
      // Admin credentials already set, go directly to login
      setStep(2);
    }
  }, [adminConfig]);

  const handleCredentialSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match.',
        variant: 'destructive'
      });
      return;
    }

    if (formData.newPassword.length < 8) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await updateAdminConfig({
        admin_email: formData.newEmail,
        admin_password_hash: btoa(formData.newPassword),
        admin_key: formData.adminKey || formData.newEmail,
        secret_key: formData.secretKey || '!@#$'
      });

      setStep(2);
      
      toast({
        title: 'Credentials Updated',
        description: 'Admin credentials have been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Setup Failed',
        description: 'Failed to update admin credentials.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!adminConfig) {
        throw new Error('Admin configuration not found');
      }

      const emailMatch = loginData.email === adminConfig.admin_email;
      const passwordMatch = btoa(loginData.password) === adminConfig.admin_password_hash;
      
      if (emailMatch && passwordMatch) {
        await trackLoginAttempt(true);
        
        localStorage.setItem('isOwner', 'true');
        localStorage.setItem('adminAuthenticated', new Date().toISOString());
        
        toast({
          title: 'Admin Access Granted',
          description: 'Welcome to the admin dashboard.',
        });

        navigate('/admin-dashboard');
      } else {
        await trackLoginAttempt(false);
        
        toast({
          title: 'Invalid Credentials',
          description: 'The admin credentials are incorrect.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Authentication Error',
        description: 'Failed to authenticate admin credentials.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

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
              <Shield className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {step === 1 ? 'Admin Setup Required' : 'Admin Login'}
          </h1>
          <p className="text-gray-400">
            {step === 1 
              ? 'Welcome, Admin. Please set up your credentials for secure access.' 
              : 'Enter your admin credentials to continue.'
            }
          </p>
        </div>

        {/* Step 1: Credential Setup */}
        {step === 1 && (
          <Card className="bg-slate-800/50 border-slate-700 p-8">
            <form onSubmit={handleCredentialSetup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newEmail" className="text-white flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>Admin Email</span>
                </Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={formData.newEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, newEmail: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter admin email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminKey" className="text-white flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>Admin Key (Forgot Password Access)</span>
                </Label>
                <Input
                  id="adminKey"
                  type="text"
                  value={formData.adminKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, adminKey: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter admin key (default: your email)"
                />
                <p className="text-gray-400 text-xs">This key triggers admin access in forgot password</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>Admin Password</span>
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter admin password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>Confirm Password</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Confirm admin password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secretKey" className="text-white flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>Secret Recovery Key</span>
                </Label>
                <Input
                  id="secretKey"
                  type="password"
                  value={formData.secretKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, secretKey: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter secret key (default: !@#$)"
                />
                <p className="text-gray-400 text-xs">Used to unlock admin after 5 failed attempts</p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Setting up...' : 'Setup Admin Credentials'}
              </Button>
            </form>
          </Card>
        )}

        {/* Step 2: Admin Login */}
        {step === 2 && (
          <Card className="bg-slate-800/50 border-slate-700 p-8">
            <div className="mb-6 bg-green-900/20 border border-green-600/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-400 mt-0.5" />
                <p className="text-green-200 text-sm">
                  Admin credentials are configured. Please login with your credentials.
                </p>
              </div>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>Admin Email</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter your admin email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>Admin Password</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
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

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-gray-400 hover:text-gray-300 text-sm flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Setup</span>
              </button>
            </div>
          </Card>
        )}

        {/* Security Notice */}
        <div className="mt-6 bg-red-900/20 border border-red-600/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-red-200 text-sm">
                <strong>Security:</strong> These credentials will be used for all future admin access.
                Make sure to remember them securely.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSetup;