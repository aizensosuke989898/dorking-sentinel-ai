
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Bot, FileText, Settings, LogOut, Scan, AlertTriangle, Download, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import ScanResults from '@/components/ScanResults';
import AIChat from '@/components/AIChat';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [domain, setDomain] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/auth');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isOwner');
    localStorage.removeItem('adminAuthenticated');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    navigate('/');
  };

  const validateDomain = (domain: string) => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const handleScan = async () => {
    if (!domain.trim()) {
      toast({
        title: 'Domain Required',
        description: 'Please enter a domain to scan.',
        variant: 'destructive'
      });
      return;
    }

    if (!validateDomain(domain)) {
      toast({
        title: 'Invalid Domain',
        description: 'Please enter a valid domain (e.g., example.com).',
        variant: 'destructive'
      });
      return;
    }

    setIsScanning(true);
    
    try {
      // Simulate scanning process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock scan results
      const mockResults = {
        domain: domain,
        scanId: Math.random().toString(36),
        timestamp: new Date().toISOString(),
        findings: [
          {
            type: 'Exposed API Key',
            url: `https://github.com/example/${domain}/blob/main/config.js`,
            context: 'API_KEY="sk-1234567890abcdef"',
            riskLevel: 5,
            confidence: 0.95,
            explanation: 'Hardcoded API key found in public repository. This could allow unauthorized access to services.'
          },
          {
            type: 'Database Credentials',
            url: `https://${domain}/admin/config.php`,
            context: 'mysql://user:password@localhost/db',
            riskLevel: 4,
            confidence: 0.87,
            explanation: 'Database connection string exposed. Could lead to data breach if accessible.'
          },
          {
            type: 'JWT Secret',
            url: `https://api.${domain}/env`,
            context: 'JWT_SECRET=supersecretkey123',
            riskLevel: 4,
            confidence: 0.92,
            explanation: 'JWT signing secret exposed. Attackers could forge authentication tokens.'
          }
        ],
        summary: {
          totalFindings: 3,
          highRisk: 1,
          mediumRisk: 2,
          lowRisk: 0
        }
      };

      setScanResults(mockResults);
      
      toast({
        title: 'Scan Complete',
        description: `Found ${mockResults.findings.length} potential security issues.`,
      });

    } catch (error) {
      toast({
        title: 'Scan Failed',
        description: 'An error occurred during the scan. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const isOwner = localStorage.getItem('isOwner') === 'true';

  if (!user) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-purple-400" />
              <div>
                <h1 className="text-xl font-bold text-white">H-CARF Scanner</h1>
                <p className="text-sm text-gray-400">Welcome back, {user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isOwner && (
                <Button
                  onClick={() => navigate('/admin-dashboard')}
                  className="bg-red-600 hover:bg-red-700 text-sm"
                >
                  Admin Panel
                </Button>
              )}
              
              <Button
                variant="ghost"
                onClick={() => setShowChat(!showChat)}
                className="text-purple-400 hover:text-purple-300"
              >
                <Bot className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex gap-8">
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${showChat ? 'mr-96' : ''}`}>
          {/* Scan Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Scan className="h-6 w-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Domain Security Scanner</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <Input
                    placeholder="Enter domain (e.g., example.com)"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="flex-1 bg-slate-700 border-slate-600 text-white"
                    disabled={isScanning}
                  />
                  <Button
                    onClick={handleScan}
                    disabled={isScanning || !domain.trim()}
                    className="bg-purple-600 hover:bg-purple-700 min-w-[120px]"
                  >
                    {isScanning ? 'Scanning...' : 'Start Scan'}
                  </Button>
                </div>
                
                <div className="bg-amber-900/20 border border-amber-600/50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-amber-200 text-sm">
                        <strong>Legal Notice:</strong> Only scan domains you own or have explicit permission to test. 
                        Unauthorized scanning may violate laws and terms of service.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Scan Progress */}
          {isScanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex items-center space-x-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                  <div>
                    <h3 className="text-white font-semibold">Scanning {domain}...</h3>
                    <p className="text-gray-400 text-sm">
                      Running Google Dorks and GitHub reconnaissance queries
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 bg-slate-700 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full w-2/3 animate-pulse"></div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Scan Results */}
          {scanResults && !isScanning && (
            <ScanResults results={scanResults} />
          )}

          {/* Recent Scans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <History className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-white">Recent Scans</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">example.com</p>
                    <p className="text-gray-400 text-sm">3 findings • High risk</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">2 hours ago</p>
                    <Button size="sm" variant="ghost" className="text-purple-400 hover:text-purple-300">
                      View Results
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* AI Chat Sidebar */}
        {showChat && <AIChat />}
      </div>
    </div>
  );
};

export default Dashboard;
