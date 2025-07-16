
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, Github, Chrome, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if legal terms accepted
    const legalAccepted = localStorage.getItem('legalAccepted');
    if (!legalAccepted) {
      navigate('/');
    }

    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkUser();
  }, [navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!isLogin) {
      if (!formData.name || formData.name.length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    
    try {
      if (isLogin) {
        // Login flow - check if user exists first
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrors({ 
              email: 'User not registered or invalid credentials. Please sign up first or check your credentials.' 
            });
          } else {
            setErrors({ general: error.message });
          }
          return;
        }

        if (data.user) {
          toast({
            title: 'Login Successful',
            description: `Welcome back! Redirecting to dashboard...`,
          });

          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        }
      } else {
        // Registration flow
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              name: formData.name,
            }
          }
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            setErrors({ 
              email: 'User already registered. Please login instead.' 
            });
          } else {
            setErrors({ general: error.message });
          }
          return;
        }

        if (data.user) {
          toast({
            title: 'Registration Successful',
            description: 'Please check your email to verify your account, then you can login.',
          });

          // Switch to login mode after successful registration
          setIsLogin(true);
          setFormData({ email: formData.email, password: '', confirmPassword: '', name: '' });
        }
      }
    } catch (error: any) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        toast({
          title: 'OAuth Error',
          description: `${provider} authentication failed. Please check your configuration.`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'OAuth Error',
        description: `${provider} authentication failed. Please try again.`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
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
            <div className="bg-purple-600 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Join H-CARF'}
          </h1>
          <p className="text-gray-400">
            {isLogin ? 'Sign in to your account' : 'Create your security research account'}
          </p>
        </div>

        {/* Main Form */}
        <Card className="bg-slate-800/50 border-slate-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error Display */}
            {errors.general && (
              <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                  <p className="text-red-200 text-sm">{errors.general}</p>
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Full Name</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Email Address</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>Password</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Confirm Password</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword}</p>}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          {/* OAuth Options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-slate-800 px-2 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthLogin('google')}
                className="border-slate-600 text-white hover:bg-slate-700"
                disabled={loading}
              >
                <Chrome className="h-4 w-4 mr-2" />
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthLogin('github')}
                className="border-slate-600 text-white hover:bg-slate-700"
                disabled={loading}
              >
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </Button>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
            
            {isLogin && (
              <div>
                <button
                  type="button"
                  onClick={() => navigate('/admin-auth')}
                  className="text-gray-500 hover:text-gray-400 text-xs"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 bg-amber-900/20 border border-amber-600/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
            <div>
              <p className="text-amber-200 text-sm">
                <strong>Security Notice:</strong> Your account will be used for authorized security research only. 
                All activities are logged and monitored for compliance.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
