
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (requireAdmin) {
        const isOwner = localStorage.getItem('isOwner') === 'true';
        const adminAuth = localStorage.getItem('adminAuthenticated');
        
        if (!isOwner || !adminAuth) {
          navigate('/dashboard');
        }
      }
    }
  }, [user, loading, requireAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (requireAdmin) {
    const isOwner = localStorage.getItem('isOwner') === 'true';
    const adminAuth = localStorage.getItem('adminAuthenticated');
    
    if (!isOwner || !adminAuth) {
      return null; // Will redirect in useEffect
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
