
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff, AlertTriangle, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface APIKeySetupProps {
  onClose: () => void;
}

const APIKeySetup = ({ onClose }: APIKeySetupProps) => {
  const [searchKey, setSearchKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [showSearchKey, setShowSearchKey] = useState(false);
  const [showGithubToken, setShowGithubToken] = useState(false);

  const handleSubmit = () => {
    // Save to localStorage for this session
    if (searchKey) localStorage.setItem('google_search_api_key', searchKey);
    if (githubToken) localStorage.setItem('github_token', githubToken);
    
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
              <Badge variant="outline" className="border-orange-500 text-orange-400">
                Optional
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
            <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-blue-200 text-sm mb-2">
                    <strong>Enhanced Scanning:</strong> Provide API keys for real-time data from Google and GitHub.
                  </p>
                  <p className="text-blue-300/70 text-xs">
                    Without API keys, the scanner will use mock data for demonstration purposes.
                  </p>
                </div>
              </div>
            </div>

            {/* Google Custom Search API */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-white font-medium">Google Custom Search API Key</label>
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
                  type={showSearchKey ? 'text' : 'password'}
                  placeholder="Enter your Google Custom Search API key..."
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0 text-gray-400 hover:text-white"
                  onClick={() => setShowSearchKey(!showSearchKey)}
                >
                  {showSearchKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
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

            <div className="flex space-x-4">
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={!searchKey && !githubToken}
              >
                Use API Keys
              </Button>
              <Button
                onClick={handleSkip}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Skip (Use Mock Data)
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              API keys are stored locally in your browser and never sent to our servers
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default APIKeySetup;
