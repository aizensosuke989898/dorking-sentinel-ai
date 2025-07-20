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
      if (!user && !requireAdmin) {
        // Regular user route but no user logged in
        navigate('/auth');
      } else if (requireAdmin) {
        // Admin route - check admin authentication
        const isOwner = localStorage.getItem('isOwner') === 'true';
        const adminAuth = localStorage.getItem('adminAuthenticated');
        
        if (!isOwner || !adminAuth) {
          // Not authenticated as admin, redirect to admin auth
          navigate('/admin-auth');
        } else {
          // Check if admin session is still valid (24 hours)
          const authTime = new Date(adminAuth).getTime();
          const now = new Date().getTime();
          const hoursDiff = (now - authTime) / (1000 * 60 * 60);
          
          if (hoursDiff > 24) {
            // Admin session expired
            localStorage.removeItem('isOwner');
            localStorage.removeItem('adminAuthenticated');
            navigate('/admin-auth');
          }
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

  // For user routes, ensure user is logged in
  if (!requireAdmin && !user) {
    return null; // Will redirect in useEffect
  }

  // For admin routes, ensure admin is authenticated
  if (requireAdmin) {
    const isOwner = localStorage.getItem('isOwner') === 'true';
    const adminAuth = localStorage.getItem('adminAuthenticated');
    
    if (!isOwner || !adminAuth) {
      return null; // Will redirect in useEffect
    }

    // Check if admin session is still valid
    const authTime = new Date(adminAuth).getTime();
    const now = new Date().getTime();
    const hoursDiff = (now - authTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      return null; // Will redirect in useEffect
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;