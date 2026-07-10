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
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: '',
      isBot: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(true);

    try {
      const res = await fetch('/functions/v1/chatbot-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText })
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done && reader) {
        const result = await reader.read();
        done = result.done;
        const chunk = decoder.decode(result.value || new Uint8Array(), { stream: !done });
        if (chunk) {
          setMessages(prev => prev.map(m => m.id === botMessage.id ? { ...m, text: m.text + chunk } : m));
        }
      }
    } catch (err) {
      console.error('chatbot error', err);
      setMessages(prev => prev.map(m => m.id === botMessage.id ? { ...m, text: 'Sorry, something went wrong.' } : m));
    } finally {
      setIsTyping(false);
    }
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
