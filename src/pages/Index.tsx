
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Users, Bot, AlertTriangle, Github, Chrome, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [showLegalModal, setShowLegalModal] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleGetStarted = () => {
    setShowLegalModal(true);
  };

  const acceptLegal = () => {
    localStorage.setItem('legalAccepted', 'true');
    setShowLegalModal(false);
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <Shield className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">H-CARF Scanner</span>
          </motion.div>
          <div className="flex space-x-4">
            <Button 
              variant="ghost" 
              className="text-white hover:text-purple-300"
              onClick={() => navigate('/auth')}
            >
              Login
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Ethical Domain
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {" "}Security Scanner
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Professional cybersecurity tool for ethical domain scanning, vulnerability research, and security assessment. 
            Powered by AI and designed for security professionals.
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3"
              onClick={handleGetStarted}
            >
              Start Scanning
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white text-lg px-8 py-3"
              onClick={() => navigate('/about')}
            >
              Learn More
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          <FeatureCard 
            icon={<Search className="h-8 w-8" />}
            title="Advanced Scanning"
            description="Comprehensive domain analysis using curated Google Dorks and GitHub reconnaissance"
          />
          <FeatureCard 
            icon={<Bot className="h-8 w-8" />}
            title="AI Assistant"
            description="Intelligent analysis and recommendations powered by advanced AI technology"
          />
          <FeatureCard 
            icon={<Shield className="h-8 w-8" />}
            title="Secure Platform"
            description="Built with security-first architecture and enterprise-grade protection"
          />
          <FeatureCard 
            icon={<Users className="h-8 w-8" />}
            title="Team Management"
            description="Advanced admin controls and user management for organizations"
          />
        </motion.div>

        {/* Warning Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-amber-900/30 border border-amber-600 rounded-lg p-6 mb-8"
        >
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-amber-400" />
            <div>
              <h3 className="text-amber-400 font-semibold">Educational and Ethical Use Only</h3>
              <p className="text-amber-200 text-sm">
                This tool is designed for authorized security research, penetration testing, and educational purposes. 
                Unauthorized scanning of domains you don't own is prohibited and may be illegal.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Legal Modal */}
      {showLegalModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center space-x-3 mb-6">
              <AlertTriangle className="h-8 w-8 text-amber-400" />
              <h2 className="text-2xl font-bold text-white">Legal Notice & Terms of Use</h2>
            </div>
            
            <div className="space-y-4 text-gray-300 mb-8">
              <p><strong className="text-white">By using H-CARF Scanner, you agree to:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Only scan domains you own or have explicit written permission to test</li>
                <li>Use this tool for educational, research, or authorized penetration testing purposes only</li>
                <li>Not use this tool for illegal activities, unauthorized access, or malicious purposes</li>
                <li>Comply with all applicable local, national, and international laws</li>
                <li>Take full responsibility for your actions and any consequences thereof</li>
              </ul>
              
              <p className="text-amber-300 font-semibold">
                ⚠️ Unauthorized domain scanning may violate computer fraud laws and terms of service. 
                You are solely responsible for ensuring your use is legal and authorized.
              </p>
              
              <p className="text-sm text-gray-400">
                This tool is provided "as-is" for educational purposes. The developers are not responsible 
                for any misuse or legal consequences arising from its use.
              </p>
            </div>

            <div className="flex space-x-4">
              <Button 
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={acceptLegal}
              >
                I Accept - Continue
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-gray-600 text-gray-300"
                onClick={() => setShowLegalModal(false)}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-colors">
    <div className="text-purple-400 mb-4">{icon}</div>
    <h3 className="text-white font-semibold mb-2">{title}</h3>
    <p className="text-gray-400 text-sm">{description}</p>
  </Card>
);

export default Index;
