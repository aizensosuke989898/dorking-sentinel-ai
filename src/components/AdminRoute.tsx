import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const isOwner = localStorage.getItem('isOwner') === 'true';
    const adminAuth = localStorage.getItem('adminAuthenticated');
    const adminBypass = sessionStorage.getItem('adminBypass') === 'true';
    
    if (!isOwner || (!adminAuth && !adminBypass)) {
      // Not authenticated as admin, redirect to admin auth
      navigate('/admin-auth');
      return;
    }

    if (adminAuth && !adminBypass) {
      // Check if admin session is still valid (24 hours)
      const authTime = new Date(adminAuth).getTime();
      const now = new Date().getTime();
      const hoursDiff = (now - authTime) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        // Admin session expired
        localStorage.removeItem('isOwner');
        localStorage.removeItem('adminAuthenticated');
        navigate('/admin-auth');
        return;
      }
    }
  }, [navigate]);

  const isOwner = localStorage.getItem('isOwner') === 'true';
  const adminAuth = localStorage.getItem('adminAuthenticated');
  const adminBypass = sessionStorage.getItem('adminBypass') === 'true';
  
  if (!isOwner || (!adminAuth && !adminBypass)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Redirecting to admin authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;