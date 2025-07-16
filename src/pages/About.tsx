
import { motion } from 'framer-motion';
import { Shield, Search, Bot, Users, AlertTriangle, Github, Globe, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

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
              onClick={() => navigate('/')}
            >
              Home
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            About H-CARF
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {" "}Security Scanner
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Professional-grade cybersecurity tool designed for ethical security research, 
            vulnerability assessment, and educational purposes.
          </p>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          <FeatureCard
            icon={<Search className="h-8 w-8" />}
            title="Advanced Domain Scanning"
            description="Comprehensive analysis using curated Google Dorks and GitHub reconnaissance to identify potential security exposures."
          />
          <FeatureCard
            icon={<Bot className="h-8 w-8" />}
            title="AI-Powered Analysis"
            description="Intelligent vulnerability assessment with detailed explanations and remediation recommendations powered by advanced AI."
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8" />}
            title="Security-First Design"
            description="Built with enterprise-grade security practices, encrypted communications, and responsible disclosure principles."
          />
          <FeatureCard
            icon={<Users className="h-8 w-8" />}
            title="Team Collaboration"
            description="Multi-user support with role-based access controls and comprehensive audit trails for organizational security teams."
          />
          <FeatureCard
            icon={<Globe className="h-8 w-8" />}
            title="Export & Reporting"
            description="Professional reports in multiple formats (PDF, JSON, Markdown) for compliance and documentation purposes."
          />
          <FeatureCard
            icon={<Lock className="h-8 w-8" />}
            title="Compliance Ready"
            description="Designed to support security frameworks like OWASP, NIST, and industry best practices for ethical security testing."
          />
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-8">Technology Stack</h2>
          <Card className="bg-slate-800/50 border-slate-700 p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Frontend Technologies</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• React with TypeScript for type-safe development</li>
                  <li>• Vite for fast development and optimized builds</li>
                  <li>• Tailwind CSS for modern, responsive design</li>
                  <li>• Framer Motion for smooth animations</li>
                  <li>• Shadcn/ui for accessible component library</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Backend & Security</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Supabase for authentication and database</li>
                  <li>• Row Level Security (RLS) for data protection</li>
                  <li>• bcrypt for secure password hashing</li>
                  <li>• Rate limiting and CAPTCHA protection</li>
                  <li>• OpenAI integration for AI analysis</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Use Cases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-8">Legitimate Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Security Research</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Authorized penetration testing of owned domains</li>
                <li>• Security assessment for compliance audits</li>
                <li>• Vulnerability research for responsible disclosure</li>
                <li>• Academic research in cybersecurity</li>
              </ul>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Educational Purposes</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Cybersecurity training and awareness</li>
                <li>• Learning about common security misconfigurations</li>
                <li>• Understanding OSINT techniques</li>
                <li>• Developing security best practices</li>
              </ul>
            </Card>
          </div>
        </motion.div>

        {/* Legal Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-16"
        >
          <Card className="bg-amber-900/20 border-amber-600/50 p-8">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="h-8 w-8 text-amber-400 mt-1" />
              <div>
                <h3 className="text-2xl font-bold text-amber-300 mb-4">Important Legal Notice</h3>
                <div className="space-y-4 text-amber-200">
                  <p>
                    H-CARF Scanner is designed exclusively for ethical security research and educational purposes. 
                    Users must comply with all applicable laws and regulations.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Authorized Use Only:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Only scan domains you own or have explicit permission to test</li>
                        <li>• Obtain written authorization before testing third-party systems</li>
                        <li>• Follow responsible disclosure practices for any findings</li>
                        <li>• Respect rate limits and terms of service</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Prohibited Activities:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Unauthorized scanning of third-party domains</li>
                        <li>• Using findings for malicious purposes</li>
                        <li>• Violating computer fraud and abuse laws</li>
                        <li>• Bypassing security measures without permission</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-sm">
                    By using this tool, you acknowledge that you are solely responsible for ensuring 
                    your activities are legal and authorized. The developers assume no responsibility 
                    for misuse or legal consequences.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Open Source */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="text-center"
        >
          <Card className="bg-slate-800/50 border-slate-700 p-8">
            <Github className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Open Source & Community</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              H-CARF Scanner is committed to transparency and community-driven security research. 
              The source code is available for review, contribution, and educational purposes.
            </p>
            <div className="flex justify-center space-x-4">
              <Button className="bg-purple-600 hover:bg-purple-700">
                View Documentation
              </Button>
              <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white">
                Contribute
              </Button>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-colors">
    <div className="text-purple-400 mb-4">{icon}</div>
    <h3 className="text-white font-semibold mb-3 text-lg">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
  </Card>
);

export default About;
