import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatbotInterfaceProps {
  onClose: () => void;
}

const ChatbotInterface: React.FC<ChatbotInterfaceProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Ishmam's digital twin. I can tell you about his experience, projects, and skills. What would you like to know?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll only within the message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: "end" });
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('experience') || lowerMessage.includes('work')) {
      return "I have experience in full-stack development, data science, and AI applications. I've worked on various projects involving LLMs, multi-agent architectures, web applications, and natural language processing.";
    } else if (lowerMessage.includes('project') || lowerMessage.includes('portfolio')) {
      return "I've built several interesting projects including web applications, mobile apps, data science projects, and AI-powered solutions. You can check out the Projects section to see detailed examples of my work!";
    } else if (lowerMessage.includes('skill') || lowerMessage.includes('technology')) {
      return "My main skills include React, Node.js, Python, TypeScript, machine learning, natural language processing, and working with LLMs and AI architectures. I'm passionate about creating innovative solutions!";
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('hire') || lowerMessage.includes('reach')) {
      return "You can reach me through the contact form on this website, or connect with me on LinkedIn, GitHub, or send me an email at ishmam.a.solaiman@gmail.com. I'm always open to discussing new opportunities!";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! Great to meet you! I'm here to tell you all about Ishmam's background and experience. What specific area would you like to know about?";
    } else {
      return "That's an interesting question! I'd love to tell you more about Ishmam's work in software development, AI, and data science. Feel free to ask about his projects, skills, or experience!";
    }
  };

  // Accepts only FormEvent from form submit now
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputText),
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  // For Enter key, trigger form submit only if not typing.
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isTyping) {
      // Let the form handle submit, prevent double submit if needed.
    }
  };

  return (
    <div
      className="bg-cyber-darker border-2 border-neon-purple rounded-lg p-4 max-w-2xl w-full animate-fade-in h-[22.5rem] flex flex-col"
      tabIndex={-1}
      style={{
        minHeight: '22.5rem',
        maxHeight: '22.5rem',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-neon-purple/30">
        <div className="flex items-center gap-2">
          <Bot className="text-neon-green w-5 h-5" />
          <span className="text-neon-yellow font-semibold">Ishmam's Digital Twin</span>
        </div>
        <Button
          type="button"
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="text-neon-pink hover:text-neon-yellow hover:bg-neon-purple/20"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages - internal scroll only, does not affect outside layout */}
      <div
        className="flex-1 overflow-y-auto mb-4 space-y-3 scrollbar-thin scrollbar-thumb-neon-purple scrollbar-track-cyber-dark"
        style={{ minHeight: 0 }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-2 ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            {message.isBot && (
              <Bot className="text-neon-green w-4 h-4 mt-1 flex-shrink-0" />
            )}
            <div
              className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                message.isBot
                  ? 'bg-neon-purple/20 text-neon-green border border-neon-purple/30'
                  : 'bg-neon-green/20 text-neon-yellow border border-neon-green/30'
              }`}
            >
              {message.text}
            </div>
            {!message.isBot && (
              <User className="text-neon-yellow w-4 h-4 mt-1 flex-shrink-0" />
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-start gap-2">
            <Bot className="text-neon-green w-4 h-4 mt-1 flex-shrink-0" />
            <div className="bg-neon-purple/20 text-neon-green border border-neon-purple/30 px-3 py-2 rounded-lg text-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className="flex gap-2" onSubmit={handleSendMessage}>
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Ask me about Ishmam's experience..."
          className="flex-1 bg-cyber-dark border-neon-purple/50 text-neon-green placeholder:text-neon-pink/70 focus:border-neon-green"
          disabled={isTyping}
        />
        <Button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="bg-neon-green hover:bg-neon-green/80 text-cyber-dark"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatbotInterface;
