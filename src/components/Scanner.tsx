import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertTriangle, CheckCircle, XCircle, Github, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApiKeys } from '@/hooks/useApiKeys';
import { useToast } from '@/hooks/use-toast';
import { scanDomainReal } from '@/utils/realScanningEngine';
import APIKeySetup from '@/components/APIKeySetup';
import ScanResults from '@/components/ScanResults';

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

    // Validate API keys before scanning
    if (!hasValidKeys()) {
      toast({
        title: "API Keys Required",
        description: "Please configure your GitHub and Google API keys before scanning",
        variant: "destructive"
      });
      setShowApiSetup(true);
      return;
    }

    setScanning(true);
    try {
      const results = await scanDomainReal(domain.trim(), apiKeys);
      setScanResults(results);
      
      if (results.findings.length === 0) {
        toast({
          title: "Scan Complete",
          description: "No vulnerable repositories found for this domain"
        });
      } else {
        toast({
          title: "Scan Complete",
          description: `Found ${results.findings.length} potential security issues`
        });
      }
    } catch (error) {
      console.error('Scan error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      toast({
        title: "Scan Failed",
        description: errorMessage,
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
                ⚠️ API keys not configured. Real-time scanning disabled. Configure your API keys to enable live GitHub and Google scanning.
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
      {showApiSetup && (
        <APIKeySetup onClose={() => setShowApiSetup(false)} />
      )}
    </div>
  );
};