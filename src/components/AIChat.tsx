
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, User, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "I'm your cybersecurity AI assistant. I can help explain scan findings, suggest security improvements, and answer questions about cybersecurity best practices. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(input);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Security-focused responses
    if (input.includes('api key') || input.includes('credential')) {
      return "API keys and credentials should never be hardcoded in source code. Use environment variables, secret management systems like AWS Secrets Manager, or encrypted configuration files. If you've found exposed credentials, rotate them immediately and implement proper secret scanning in your CI/CD pipeline.";
    }
    
    if (input.includes('jwt') || input.includes('token')) {
      return "JWT tokens contain sensitive information and should be properly secured. Use strong, randomly generated secrets for signing, implement short expiration times, and consider using refresh tokens for longer sessions. Never expose JWT secrets in client-side code or public repositories.";
    }
    
    if (input.includes('database') || input.includes('sql')) {
      return "Database security involves multiple layers: use parameterized queries to prevent SQL injection, implement proper access controls with least privilege principles, encrypt sensitive data both at rest and in transit, and regularly update database software. Never expose database credentials in configuration files.";
    }
    
    if (input.includes('scan') || input.includes('result')) {
      return "Scan results should be analyzed by risk level. High-risk findings require immediate attention, while medium and low-risk items can be addressed in your next security sprint. Always validate findings to avoid false positives, and create a remediation plan with clear timelines.";
    }
    
    if (input.includes('help') || input.includes('hello')) {
      return "I'm here to help with cybersecurity questions! I can explain scan findings, provide security best practices, suggest remediation steps, and help you understand various types of vulnerabilities. What specific security topic would you like to discuss?";
    }
    
    // Block malicious requests
    if (input.includes('hack') || input.includes('exploit') || input.includes('attack')) {
      return "I can only provide information for educational and defensive security purposes. I cannot assist with malicious activities, unauthorized access attempts, or any illegal activities. Please use this tool responsibly for legitimate security research and protection.";
    }
    
    // Default educational response
    return "That's an interesting cybersecurity question. For the most accurate and up-to-date security guidance, I recommend consulting official security frameworks like OWASP, NIST, or CIS Controls. Always ensure you're following responsible disclosure practices and only testing systems you own or have permission to assess.";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-purple-600 hover:bg-purple-700 rounded-full w-14 h-14"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed right-0 top-0 h-full w-96 bg-slate-800/95 border-l border-slate-700 z-40"
    >
      <Card className="h-full bg-transparent border-0 rounded-none flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-600 p-2 rounded-full">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">AI Security Assistant</h3>
              <p className="text-green-400 text-xs">Online</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(true)}
              className="text-gray-400 hover:text-white"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' ? 'bg-purple-600' : 'bg-slate-700'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-purple-400" />
                    )}
                  </div>
                  
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-slate-700 text-gray-300'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="bg-slate-700 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about security findings..."
              className="flex-1 bg-slate-700 border-slate-600 text-white"
              disabled={isTyping}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI responses are for educational purposes only
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

export default AIChat;
