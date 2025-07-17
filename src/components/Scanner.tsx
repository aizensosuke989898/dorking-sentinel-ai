import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertTriangle, CheckCircle, XCircle, Github, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApiKeys } from '@/hooks/useApiKeys';
import { useToast } from '@/hooks/use-toast';
import { scanDomain } from '@/utils/scanningEngine';
import { ApiKeySetup } from './ApiKeySetup';
import { ScanResults } from './ScanResults';

export const Scanner = () => {
  const [domain, setDomain] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const { apiKeys, hasValidKeys } = useApiKeys();
  const { toast } = useToast();

  const handleScan = async () => {
    if (!domain.trim()) {
      toast({
        title: "Error",
        description: "Please enter a domain to scan",
        variant: "destructive"
      });
      return;
    }

    setScanning(true);
    try {
      const results = await scanDomain(domain.trim());
      setScanResults(results);
      
      if (!hasValidKeys()) {
        toast({
          title: "Using Mock Data",
          description: "Configure your API keys for real-time scanning",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Scan Complete",
          description: `Found ${results.findings.length} potential issues`
        });
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Scan Failed",
        description: "An error occurred during scanning",
        variant: "destructive"
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* API Status Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <span>Scanner Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Github className="h-4 w-4" />
              <span className="text-sm">GitHub API:</span>
              {apiKeys.githubToken ? (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Not Set
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span className="text-sm">Google API:</span>
              {apiKeys.googleApiKey && apiKeys.googleSearchEngineId ? (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Not Set
                </Badge>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowApiSetup(true)}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Configure APIs
            </Button>
          </div>
          {!hasValidKeys() && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">
                ⚠️ API keys not configured. Scanner will use mock data for demonstration.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scan Input */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-primary" />
            <span>Domain Scanner</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Input
              placeholder="Enter domain to scan (e.g., example.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="flex-1"
              disabled={scanning}
            />
            <Button 
              onClick={handleScan}
              disabled={scanning || !domain.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {scanning ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Search className="h-4 w-4" />
                </motion.div>
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {scanning ? 'Scanning...' : 'Start Scan'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scan Results */}
      {scanResults && <ScanResults results={scanResults} />}

      {/* API Setup Modal */}
      <ApiKeySetup 
        isOpen={showApiSetup}
        onClose={() => setShowApiSetup(false)}
      />
    </div>
  );
};