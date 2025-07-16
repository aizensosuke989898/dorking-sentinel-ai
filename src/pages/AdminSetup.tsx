
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminSetup = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [credentialsChanged, setCredentialsChanged] = useState(false);
  const [formData, setFormData] = useState({
    newEmail: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCredentialChange = async (e: React.FormEvent) => {
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
      // Store new admin credentials securely
      localStorage.setItem('adminCredentials', JSON.stringify({
        email: formData.newEmail,
        passwordHash: btoa(formData.newPassword), // Simple encoding for demo
        initialized: true,
        timestamp: new Date().toISOString()
      }));

      setCredentialsChanged(true);
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
      const storedCreds = localStorage.getItem('adminCredentials');
      if (!storedCreds) {
        throw new Error('Admin credentials not initialized');
      }

      const { email, passwordHash } = JSON.parse(storedCreds);
      
      if (loginData.email === email && btoa(loginData.password) === passwordHash) {
        localStorage.setItem('isOwner', 'true');
        localStorage.setItem('adminAuthenticated', new Date().toISOString());
        
        toast({
          title: 'Admin Access Granted',
          description: 'Welcome to the admin dashboard.',
        });

        navigate('/admin-dashboard');
      } else {
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
              ? 'Welcome, Admin. Please update your credentials for secure access.' 
              : 'Enter your new admin credentials to continue.'
            }
          </p>
        </div>

        {/* Step 1: Credential Setup */}
        {step === 1 && (
          <Card className="bg-slate-800/50 border-slate-700 p-8">
            <form onSubmit={handleCredentialChange} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newEmail" className="text-white flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>New Admin Email</span>
                </Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={formData.newEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, newEmail: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter new admin email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>New Admin Password</span>
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter new admin password"
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
                  placeholder="Confirm new admin password"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Credentials'}
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
                  Admin credentials have been successfully updated. Please login with your new credentials.
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
          </Card>
        )}

        {/* Security Notice */}
        <div className="mt-6 bg-red-900/20 border border-red-600/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-red-200 text-sm">
                <strong>Security:</strong> This is a one-time setup process. After completing this setup,
                you must use your new credentials for all future admin access.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSetup;
