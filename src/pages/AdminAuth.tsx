
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Key, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminAuth = () => {
  const [formData, setFormData] = useState({
    favoriteColor: '',
    schoolName: ''
  });
  const [loading, setLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
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
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Default admin credentials (in production, these would be hashed and stored securely)
    const validColor = '123456';
    const validSchool = 'crescent';

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (formData.favoriteColor === validColor && formData.schoolName === validSchool) {
        setShowWarning(true);
      } else {
        toast({
          title: 'Invalid Credentials',
          description: 'The security questions were answered incorrectly.',
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

  const acceptWarning = () => {
    localStorage.setItem('isOwner', 'true');
    localStorage.setItem('adminAuthenticated', new Date().toISOString());
    
    toast({
      title: 'Admin Access Granted',
      description: 'Welcome to the admin dashboard.',
    });

    navigate('/admin-dashboard');
  };

  const denyWarning = () => {
    setShowWarning(false);
    setFormData({ favoriteColor: '', schoolName: '' });
    toast({
      title: 'Access Denied',
      description: 'Admin access was declined.',
    });
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
          <h1 className="text-3xl font-bold text-white mb-2">Password Recovery</h1>
          <p className="text-gray-400">Answer security questions to recover your account</p>
        </div>

        {/* Main Form */}
        <Card className="bg-slate-800/50 border-slate-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="favoriteColor" className="text-white flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>What's your favorite color?</span>
              </Label>
              <Input
                id="favoriteColor"
                type="text"
                value={formData.favoriteColor}
                onChange={(e) => setFormData(prev => ({ ...prev, favoriteColor: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter your favorite color"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolName" className="text-white flex items-center space-x-2">
                <School className="h-4 w-4" />
                <span>What's your school name?</span>
              </Label>
              <Input
                id="schoolName"
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter your school name"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Recover Account'}
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
                <strong>Security:</strong> This recovery process is monitored. Multiple failed attempts 
                will be logged and may result in account suspension.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Legal Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border-2 border-red-500 rounded-lg p-8 max-w-lg w-full"
          >
            <div className="flex items-center space-x-3 mb-6">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <h2 className="text-2xl font-bold text-white">⚠️ ADMIN ACCESS WARNING</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 mb-8">
              <p className="text-red-300 font-semibold text-lg">
                🚨 AUTHORIZED PERSONNEL ONLY 🚨
              </p>
              
              <div className="bg-red-900/30 border border-red-500 rounded-lg p-4">
                <p className="text-white font-semibold mb-2">You are accessing an administrative control panel.</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>This system is for authorized use only</li>
                  <li>All activities are logged and monitored</li>
                  <li>Unauthorized access is prohibited by law</li>
                  <li>Legal action may be taken against violators</li>
                </ul>
              </div>
              
              <p className="text-yellow-300 text-sm">
                By proceeding, you acknowledge that you have proper authorization to access this system 
                and accept full responsibility for your actions.
              </p>
            </div>

            <div className="flex space-x-4">
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={acceptWarning}
              >
                I Accept - Proceed
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-gray-600 text-gray-300"
                onClick={denyWarning}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminAuth;
