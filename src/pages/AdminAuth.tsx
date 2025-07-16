
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Key, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminAuth = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if regular user is logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkUser();

    // Check if admin credentials are initialized
    const storedCreds = localStorage.getItem('adminCredentials');
    if (!storedCreds) {
      navigate('/admin-setup');
      return;
    }

    const { initialized } = JSON.parse(storedCreds);
    if (!initialized) {
      navigate('/admin-setup');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const storedCreds = localStorage.getItem('adminCredentials');
      if (!storedCreds) {
        throw new Error('Admin credentials not found');
      }

      const { email, passwordHash } = JSON.parse(storedCreds);

      if (formData.email === email && btoa(formData.password) === passwordHash) {
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
        description: 'An error occurred during authentication.',
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
              <Key className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-gray-400">Enter your admin credentials to access the dashboard</p>
        </div>

        {/* Main Form */}
        <Card className="bg-slate-800/50 border-slate-700 p-8">
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

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="text-gray-400 hover:text-gray-300 text-sm"
            >
              Back to Login
            </button>
          </div>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 bg-red-900/20 border border-red-600/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-red-200 text-sm">
                <strong>Security:</strong> This is a restricted admin area. All access attempts
                are logged and monitored for security compliance.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAuth;
