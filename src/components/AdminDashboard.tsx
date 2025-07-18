import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Settings, 
  Activity, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  Eye,
  LogOut,
  Key,
  Monitor,
  Ban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  is_blocked: boolean;
  scan_count: number;
}

interface ScanLog {
  id: string;
  user_id: string;
  domain: string;
  scan_type: string;
  results_count: number;
  created_at: string;
  user_email?: string;
}

interface LoginHistory {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user_email?: string;
}

export const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [adminConfig, setAdminConfig] = useState({
    adminKey: 'admin@gmail.com',
    adminEmail: '',
    adminPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadAdminData();
    loadAdminConfig();
  }, []);

  const loadAdminConfig = () => {
    const storedConfig = localStorage.getItem('adminCredentials');
    if (storedConfig) {
      const config = JSON.parse(storedConfig);
      setAdminConfig({
        adminKey: config.adminKey || 'admin@gmail.com',
        adminEmail: config.email || '',
        adminPassword: config.password || ''
      });
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Load users with profiles
      const { data: profilesData } = await (supabase as any)
        .from('user_profiles')
        .select('*');

      // Load scan logs
      const { data: scanData } = await (supabase as any)
        .from('scan_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Load login history  
      const { data: loginData } = await (supabase as any)
        .from('login_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      setUsers(profilesData || []);
      setScanLogs(scanData || []);
      setLoginHistory(loginData || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAdminConfig = () => {
    const newConfig = {
      adminKey: adminConfig.adminKey,
      email: adminConfig.adminEmail,
      password: adminConfig.adminPassword
    };
    
    localStorage.setItem('adminCredentials', JSON.stringify(newConfig));
    toast({
      title: "Admin Config Updated",
      description: "Admin configuration has been updated successfully"
    });
  };

  const blockUser = async (userId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('user_profiles')
        .update({ is_blocked: true })
        .eq('user_id', userId);

      if (error) throw error;

      await loadAdminData();
      toast({
        title: "User Blocked",
        description: "User has been blocked successfully"
      });
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Delete from auth.users (this will cascade to profiles)
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      await loadAdminData();
      toast({
        title: "User Deleted",
        description: "User has been deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error", 
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('isOwner');
    localStorage.removeItem('adminAuthenticated');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-destructive" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">System Administration & Monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="border-muted-foreground text-muted-foreground hover:bg-muted"
              >
                <Monitor className="h-4 w-4 mr-2" />
                User Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="scans">Scan Logs</TabsTrigger>
              <TabsTrigger value="logins">Login History</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{users.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{scanLogs.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
                    <Ban className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {users.filter(u => u.is_blocked).length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Logins</CardTitle>
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loginHistory.length}</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {user.last_sign_in_at 
                              ? new Date(user.last_sign_in_at).toLocaleDateString()
                              : 'Never'
                            }
                          </TableCell>
                          <TableCell>
                            {user.is_blocked ? (
                              <Badge variant="destructive">Blocked</Badge>
                            ) : (
                              <Badge variant="default">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => blockUser(user.id)}
                                disabled={user.is_blocked}
                              >
                                <Ban className="h-3 w-3" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete User</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <p>Are you sure you want to delete this user? This action cannot be undone.</p>
                                    <div className="flex justify-end space-x-2">
                                      <Button variant="outline">Cancel</Button>
                                      <Button 
                                        variant="destructive"
                                        onClick={() => deleteUser(user.id)}
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Scan Logs Tab */}
            <TabsContent value="scans">
              <Card>
                <CardHeader>
                  <CardTitle>Scan Activity Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Results</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scanLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.user_email || 'Unknown'}</TableCell>
                          <TableCell>{log.domain}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.scan_type}</Badge>
                          </TableCell>
                          <TableCell>{log.results_count}</TableCell>
                          <TableCell>
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Login History Tab */}
            <TabsContent value="logins">
              <Card>
                <CardHeader>
                  <CardTitle>Login History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>User Agent</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loginHistory.map((login) => (
                        <TableRow key={login.id}>
                          <TableCell>{login.user_email || 'Unknown'}</TableCell>
                          <TableCell>{login.ip_address}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {login.user_agent}
                          </TableCell>
                          <TableCell>
                            {new Date(login.created_at).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Admin Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="admin-key">Admin Access Key</Label>
                      <Input
                        id="admin-key"
                        value={adminConfig.adminKey}
                        onChange={(e) => setAdminConfig(prev => ({ 
                          ...prev, 
                          adminKey: e.target.value 
                        }))}
                        placeholder="admin@gmail.com"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Key used to access admin login via forgot password
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="admin-email">Admin Email</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        value={adminConfig.adminEmail}
                        onChange={(e) => setAdminConfig(prev => ({ 
                          ...prev, 
                          adminEmail: e.target.value 
                        }))}
                        placeholder="admin@company.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="admin-password">Admin Password</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        value={adminConfig.adminPassword}
                        onChange={(e) => setAdminConfig(prev => ({ 
                          ...prev, 
                          adminPassword: e.target.value 
                        }))}
                        placeholder="New admin password"
                      />
                    </div>

                    <Button onClick={updateAdminConfig} className="bg-primary hover:bg-primary/90">
                      <Key className="h-4 w-4 mr-2" />
                      Update Admin Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};