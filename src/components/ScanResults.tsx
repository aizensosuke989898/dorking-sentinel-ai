
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Download, Eye, ExternalLink, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Finding {
  type: string;
  url: string;
  context: string;
  riskLevel: number;
  confidence: number;
  explanation: string;
}

interface ScanResults {
  domain: string;
  scanId: string;
  timestamp: string;
  findings: Finding[];
  summary: {
    totalFindings: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  };
}

interface ScanResultsProps {
  results: ScanResults;
}

const ScanResults = ({ results }: ScanResultsProps) => {
  const { toast } = useToast();

  const getRiskColor = (level: number) => {
    if (level >= 4) return 'bg-red-500';
    if (level >= 3) return 'bg-orange-500';
    if (level >= 2) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRiskText = (level: number) => {
    if (level >= 4) return 'High Risk';
    if (level >= 3) return 'Medium Risk';
    if (level >= 2) return 'Low Risk';
    return 'Info';
  };

  const exportResults = (format: 'pdf' | 'json' | 'markdown') => {
    const data = JSON.stringify(results, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-results-${results.domain}-${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: `Scan results exported as ${format.toUpperCase()}`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Scan Results</h2>
            <div className="flex items-center space-x-4 text-gray-400">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>{results.domain}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{new Date(results.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => exportResults('json')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
            <Button
              size="sm"
              onClick={() => exportResults('pdf')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button
              size="sm"
              onClick={() => exportResults('markdown')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Download className="h-4 w-4 mr-2" />
              MD
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{results.summary.totalFindings}</div>
            <div className="text-gray-400 text-sm">Total Findings</div>
          </div>
          <div className="bg-red-900/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{results.summary.highRisk}</div>
            <div className="text-gray-400 text-sm">High Risk</div>
          </div>
          <div className="bg-orange-900/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{results.summary.mediumRisk}</div>
            <div className="text-gray-400 text-sm">Medium Risk</div>
          </div>
          <div className="bg-yellow-900/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{results.summary.lowRisk}</div>
            <div className="text-gray-400 text-sm">Low Risk</div>
          </div>
        </div>
      </Card>

      {/* Findings */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-400" />
          <span>Security Findings</span>
        </h3>

        {results.findings.map((finding, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-white">{finding.type}</h4>
                    <Badge className={`${getRiskColor(finding.riskLevel)} text-white`}>
                      {getRiskText(finding.riskLevel)}
                    </Badge>
                    <Badge variant="outline" className="border-purple-400 text-purple-400">
                      {Math.round(finding.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Location:</p>
                      <div className="flex items-center space-x-2">
                        <code className="bg-slate-700 text-purple-300 px-2 py-1 rounded text-sm flex-1">
                          {finding.url}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(finding.url, '_blank')}
                          className="text-gray-400 hover:text-white"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Context:</p>
                      <code className="bg-slate-700 text-green-300 px-3 py-2 rounded text-sm block font-mono">
                        {finding.context}
                      </code>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Explanation:</p>
                      <p className="text-gray-300 text-sm">{finding.explanation}</p>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  <div className={`w-3 h-3 rounded-full ${getRiskColor(finding.riskLevel)}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recommendations */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-5 w-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Security Recommendations</h3>
        </div>
        
        <div className="space-y-3 text-gray-300 text-sm">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
            <p>Immediately revoke and rotate any exposed API keys or credentials</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2" />
            <p>Implement environment variable management for sensitive configuration</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2" />
            <p>Enable GitHub secret scanning and repository security alerts</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2" />
            <p>Regular security audits and automated scanning should be implemented</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ScanResults;
