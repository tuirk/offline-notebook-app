
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { generateAIResponse } from '../utils/aiUtils';
import { Send, Bot, User } from 'lucide-react';

interface ChatInterfaceProps {
  documentId: string;
  documentContent: string;
  messages: Array<{
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
  }>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  documentId, 
  documentContent,
  messages = []
}) => {
  const { addChatMessage } = useAppContext();
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isProcessing) return;
    
    const userMessage = message.trim();
    setMessage('');
    addChatMessage(documentId, 'user', userMessage);
    
    setIsProcessing(true);
    try {
      const aiResponse = await generateAIResponse(documentContent, userMessage);
      addChatMessage(documentId, 'ai', aiResponse);
    } catch (error) {
      console.error('Error generating AI response:', error);
      addChatMessage(documentId, 'ai', 'I apologize, but I encountered an error processing your request.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSuggestions = () => [
    "Can you summarize this document?",
    "What are the key points?",
    "Extract the main arguments.",
    "What recommendations does this document make?",
  ];

  return (
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden bg-muted/10">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Bot className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium">Ask about this document</h3>
            <p className="max-w-sm mt-2">
              Use the chat to ask questions about the document content, request summaries, or extract key information.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              <div className={`chat-bubble ${msg.role}`}>
                <div className="flex items-center gap-2 mb-1.5 text-xs opacity-70">
                  {msg.role === 'ai' ? (
                    <>
                      <Bot className="h-3.5 w-3.5" />
                      <span>AI Assistant</span>
                    </>
                  ) : (
                    <>
                      <User className="h-3.5 w-3.5" />
                      <span>You</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{formatTime(msg.timestamp)}</span>
                </div>
                <div className="whitespace-pre-line">{msg.content}</div>
              </div>
            </div>
          ))
        )}
        {isProcessing && (
          <div className="flex justify-start animate-pulse">
            <div className="chat-bubble ai">
              <div className="flex items-center gap-2 mb-1.5 text-xs opacity-70">
                <Bot className="h-3.5 w-3.5" />
                <span>AI Assistant</span>
              </div>
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {messages.length === 0 && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {getSuggestions().map((suggestion, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setMessage(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <div className="p-4 border-t bg-card">
        <div className="flex items-end gap-2">
          <Textarea
            placeholder="Ask a question about this document..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-12 resize-none"
            rows={1}
          />
          <Button size="icon" disabled={!message.trim() || isProcessing} onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
