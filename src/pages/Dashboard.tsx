import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, LogOut, Settings, User, Download, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { scanDomain } from '@/utils/scanningEngine';
import { isValidDomain } from '@/utils/domainValidator';
import ScanResults from '@/components/ScanResults';
import AIChat from '@/components/AIChat';
import APIKeySetup from '@/components/APIKeySetup';
import ProtectedRoute from '@/components/ProtectedRoute';

const Dashboard = () => {
  const [domain, setDomain] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [showAPISetup, setShowAPISetup] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleScan = async () => {
    if (!domain) {
      toast({
        title: 'Domain Required',
        description: 'Please enter a domain to scan.',
        variant: 'destructive'
      });
      return;
    }

    if (!isValidDomain(domain)) {
      toast({
        title: 'Invalid Domain',
        description: 'Please enter a valid domain (e.g., example.com).',
        variant: 'destructive'
      });
      return;
    }

    setScanning(true);
    try {
      const results = await scanDomain(domain);
      setScanResults(results);
      
      toast({
        title: 'Scan Complete',
        description: `Found ${results.vulnerabilities.length} potential vulnerabilities.`,
      });
    } catch (error) {
      toast({
        title: 'Scan Failed',
        description: 'An error occurred during scanning. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setScanning(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isOwner = localStorage.getItem('isOwner') === 'true';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <div className="bg-slate-800/50 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-purple-400" />
                <h1 className="text-xl font-bold text-white">H-CARF Scanner</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAPISetup(true)}
                  className="border-slate-600 text-gray-300 hover:bg-slate-700"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  API Keys
                </Button>

                {isOwner && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin-dashboard')}
                    className="border-red-600 text-red-300 hover:bg-red-900/20"
                  >
                    Admin Panel
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="border-slate-600 text-gray-300 hover:bg-slate-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Welcome Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Welcome to H-CARF Cybersecurity Scanner
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Perform ethical domain reconnaissance and vulnerability scanning. 
                Enter a domain below to start your security assessment.
              </p>
            </div>

            {/* Scan Input */}
            <Card className="bg-slate-800/50 border-slate-700 p-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Enter domain (e.g., example.com)"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value.trim())}
                    className="bg-slate-700 border-slate-600 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                  />
                </div>
                <Button
                  onClick={handleScan}
                  disabled={scanning}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {scanning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Start Scan
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Scan Results */}
            {scanResults && <ScanResults results={scanResults} />}
          </motion.div>
        </div>

        {/* AI Chat Button */}
        <Button
          onClick={() => setShowAIChat(true)}
          className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 rounded-full w-14 h-14 p-0"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>

        {/* Modals */}
        {showAPISetup && <APIKeySetup onClose={() => setShowAPISetup(false)} />}
        {showAIChat && <AIChat onClose={() => setShowAIChat(false)} />}
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
