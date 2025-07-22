
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Activity, Settings, Database, Key, Download, Eye, Trash2, UserX, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  lastLogin: string;
  status: 'active' | 'blocked';
}

interface ScanLog {
  id: string;
  userId: string;
  domain: string;
  timestamp: string;
  findings: number;
  riskLevel: string;
}

const AdminDashboard = () => {
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [newAdminCreds, setNewAdminCreds] = useState({
    email: '',
    password: '',
    recoveryKey: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const ownerStatus = localStorage.getItem('isOwner');
    if (ownerStatus !== 'true') {
      navigate('/dashboard');
      return;
    }
    setIsOwner(true);
    loadMockData();
  }, [navigate]);

  const loadMockData = () => {
    // Mock users data
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'user1@example.com',
        name: 'John Doe',
        role: 'user',
        lastLogin: '2024-01-15T10:30:00Z',
        status: 'active'
      },
      {
        id: '2',
        email: 'researcher@security.com',
        name: 'Jane Smith',
        role: 'user',
        lastLogin: '2024-01-14T15:45:00Z',
        status: 'active'
      },
      {
        id: '3',
        email: 'suspicious@domain.com',
        name: 'Blocked User',
        role: 'user',
        lastLogin: '2024-01-10T09:15:00Z',
        status: 'blocked'
      }
    ];

    // Mock scan logs
    const mockScanLogs: ScanLog[] = [
      {
        id: '1',
        userId: '1',
        domain: 'example.com',
        timestamp: '2024-01-15T10:35:00Z',
        findings: 3,
        riskLevel: 'High'
      },
      {
        id: '2',
        userId: '2',
        domain: 'testsite.org',
        timestamp: '2024-01-14T16:20:00Z',
        findings: 1,
        riskLevel: 'Medium'
      },
      {
        id: '3',
        userId: '1',
        domain: 'myproject.dev',
        timestamp: '2024-01-13T11:10:00Z',
        findings: 0,
        riskLevel: 'Low'
      }
    ];

    setUsers(mockUsers);
    setScanLogs(mockScanLogs);
  };

  const handleUserAction = (userId: string, action: 'block' | 'unblock' | 'delete') => {
    setUsers(prev => {
      if (action === 'delete') {
        return prev.filter(user => user.id !== userId);
      } else {
        return prev.map(user => 
          user.id === userId 
            ? { ...user, status: action === 'block' ? 'blocked' : 'active' }
            : user
        );
      }
    });

    toast({
      title: 'User Updated',
      description: `User has been ${action}ed successfully.`,
    });
  };

  const updateAdminCredentials = () => {
    if (!newAdminCreds.email || !newAdminCreds.password || !newAdminCreds.recoveryKey) {
      toast({
        title: 'Invalid Input',
        description: 'Please fill in email, password, and recovery key.',
        variant: 'destructive'
      });
      return;
    }

    // TODO: In production, update the admin_config table via API
    toast({
      title: 'Credentials Update Queued',
      description: 'Admin credentials will be updated in the database.',
    });

    setNewAdminCreds({ email: '', password: '', recoveryKey: '' });
  };

  const exportData = (type: 'users' | 'logs') => {
    const data = type === 'users' ? users : scanLogs;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: `${type} data exported successfully.`,
    });
  };

  if (!isOwner) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white">Access Denied</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-red-500/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-red-400" />
              <div>
                <h1 className="text-xl font-bold text-white">🚨 ADMIN CONTROL PANEL</h1>
                <p className="text-sm text-red-400">Authorized Personnel Only</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => {
                  localStorage.removeItem('isOwner');
                  localStorage.removeItem('adminAuthenticated');
                  sessionStorage.removeItem('adminBypass');
                  navigate('/dashboard');
                }}
                variant="outline"
                className="border-red-600 text-red-300 hover:bg-red-600"
              >
                Logout Admin
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-slate-800/50 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'logs', label: 'Scan Logs', icon: Database },
            { id: 'settings', label: 'System Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600 p-3 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{users.length}</div>
                  <div className="text-gray-400">Total Users</div>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-600 p-3 rounded-full">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{scanLogs.length}</div>
                  <div className="text-gray-400">Total Scans</div>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-red-600 p-3 rounded-full">
                  <UserX className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {users.filter(u => u.status === 'blocked').length}
                  </div>
                  <div className="text-gray-400">Blocked Users</div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">User Management</h2>
              <Button
                onClick={() => exportData('users')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Users
              </Button>
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-4 text-gray-400">User</th>
                      <th className="text-left p-4 text-gray-400">Email</th>
                      <th className="text-left p-4 text-gray-400">Last Login</th>
                      <th className="text-left p-4 text-gray-400">Status</th>
                      <th className="text-left p-4 text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-slate-700/50">
                        <td className="p-4">
                          <div className="text-white font-medium">{user.name}</div>
                          <div className="text-gray-400 text-sm">{user.role}</div>
                        </td>
                        <td className="p-4 text-gray-300">{user.email}</td>
                        <td className="p-4 text-gray-300">
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.status === 'active' 
                              ? 'bg-green-900 text-green-300' 
                              : 'bg-red-900 text-red-300'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUserAction(user.id, user.status === 'active' ? 'block' : 'unblock')}
                              className="text-yellow-400 hover:text-yellow-300"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUserAction(user.id, 'delete')}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Scan Activity Logs</h2>
              <Button
                onClick={() => exportData('logs')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-4 text-gray-400">User ID</th>
                      <th className="text-left p-4 text-gray-400">Domain</th>
                      <th className="text-left p-4 text-gray-400">Timestamp</th>
                      <th className="text-left p-4 text-gray-400">Findings</th>
                      <th className="text-left p-4 text-gray-400">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scanLogs.map(log => (
                      <tr key={log.id} className="border-b border-slate-700/50">
                        <td className="p-4 text-gray-300 font-mono">{log.userId}</td>
                        <td className="p-4 text-white">{log.domain}</td>
                        <td className="p-4 text-gray-300">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-4 text-gray-300">{log.findings}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            log.riskLevel === 'High' ? 'bg-red-900 text-red-300' :
                            log.riskLevel === 'Medium' ? 'bg-orange-900 text-orange-300' :
                            'bg-green-900 text-green-300'
                          }`}>
                            {log.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white">System Settings</h2>

            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Key className="h-5 w-5 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Update Admin Credentials</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="newEmail" className="text-white">New Admin Email</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={newAdminCreds.email}
                    onChange={(e) => setNewAdminCreds(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter new admin email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-white">New Admin Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newAdminCreds.password}
                    onChange={(e) => setNewAdminCreds(prev => ({ ...prev, password: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newRecoveryKey" className="text-white">New Recovery Key</Label>
                  <Input
                    id="newRecoveryKey"
                    type="password"
                    value={newAdminCreds.recoveryKey}
                    onChange={(e) => setNewAdminCreds(prev => ({ ...prev, recoveryKey: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter new recovery key"
                  />
                </div>
              </div>

              <Button
                onClick={updateAdminCredentials}
                className="bg-red-600 hover:bg-red-700"
              >
                Update Credentials
              </Button>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Database</span>
                    <span className="text-green-400">Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">AI Service</span>
                    <span className="text-green-400">Running</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Security Monitoring</span>
                    <span className="text-green-400">Active</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Backup</span>
                    <span className="text-gray-300">2 hours ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">System Load</span>
                    <span className="text-yellow-400">Normal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Storage</span>
                    <span className="text-green-400">75% Available</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
      
      {/* Security Notice Footer */}
      <div className="bg-red-900/20 border-t border-red-600/50 p-4">
        <div className="container mx-auto">
          <p className="text-center text-red-200 text-sm">
            <strong>Security Notice:</strong> This is a restricted admin area. All access attempts are monitored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
