
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff, AlertTriangle, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApiKeys } from '@/hooks/useApiKeys';
import { useToast } from '@/hooks/use-toast';

interface APIKeySetupProps {
  onClose: () => void;
}

const APIKeySetup = ({ onClose }: APIKeySetupProps) => {
  const { apiKeys, updateApiKeys } = useApiKeys();
  const { toast } = useToast();
  
  const [githubToken, setGithubToken] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [googleSearchEngineId, setGoogleSearchEngineId] = useState('');
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [showGoogleApiKey, setShowGoogleApiKey] = useState(false);
  const [showSearchEngineId, setShowSearchEngineId] = useState(false);

  useEffect(() => {
    // Load existing values
    setGithubToken(apiKeys.githubToken);
    setGoogleApiKey(apiKeys.googleApiKey);
    setGoogleSearchEngineId(apiKeys.googleSearchEngineId);
  }, [apiKeys]);

  const handleSubmit = () => {
    if (!githubToken || !googleApiKey || !googleSearchEngineId) {
      toast({
        title: "Incomplete Configuration",
        description: "All API keys are required for real-time scanning",
        variant: "destructive"
      });
      return;
    }

    updateApiKeys({
      githubToken,
      googleApiKey,
      googleSearchEngineId
    });
    
    toast({
      title: "API Keys Configured",
      description: "Real-time scanning is now enabled"
    });
    
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-4"
      >
        <Card className="bg-slate-800/95 border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Key className="h-6 w-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">API Configuration</h2>
              <Badge variant="outline" className="border-red-500 text-red-400">
                Required
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-6">
            <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-red-200 text-sm mb-2">
                    <strong>Production Scanner:</strong> All API keys are required for real-time GitHub and Google scanning.
                  </p>
                  <p className="text-red-300/70 text-xs">
                    This is not a demo - scanning will not work without valid API credentials.
                  </p>
                </div>
              </div>
            </div>

            {/* GitHub Token */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-white font-medium">GitHub Personal Access Token</label>
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1"
                >
                  <span>Generate Token</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="relative">
                <Input
                  type={showGithubToken ? 'text' : 'password'}
                  placeholder="Enter your GitHub personal access token..."
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0 text-gray-400 hover:text-white"
                  onClick={() => setShowGithubToken(!showGithubToken)}
                >
                  {showGithubToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Google API Key */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-white font-medium">Google API Key</label>
                <a
                  href="https://developers.google.com/custom-search/v1/introduction"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1"
                >
                  <span>Get API Key</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="relative">
                <Input
                  type={showGoogleApiKey ? 'text' : 'password'}
                  placeholder="Enter your Google API key..."
                  value={googleApiKey}
                  onChange={(e) => setGoogleApiKey(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0 text-gray-400 hover:text-white"
                  onClick={() => setShowGoogleApiKey(!showGoogleApiKey)}
                >
                  {showGoogleApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Google Search Engine ID */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-white font-medium">Google Search Engine ID (CX)</label>
                <a
                  href="https://programmablesearchengine.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1"
                >
                  <span>Create Engine</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="relative">
                <Input
                  type={showSearchEngineId ? 'text' : 'password'}
                  placeholder="Enter your Google Search Engine ID..."
                  value={googleSearchEngineId}
                  onChange={(e) => setGoogleSearchEngineId(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0 text-gray-400 hover:text-white"
                  onClick={() => setShowSearchEngineId(!showSearchEngineId)}
                >
                  {showSearchEngineId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>


            <div className="flex space-x-4">
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={!githubToken || !googleApiKey || !googleSearchEngineId}
              >
                Configure Keys
              </Button>
              <Button
                onClick={handleSkip}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              API keys are stored temporarily in your session and automatically cleared on logout
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default APIKeySetup;
