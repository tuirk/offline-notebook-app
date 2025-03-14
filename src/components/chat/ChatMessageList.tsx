
import React, { useRef, useEffect } from 'react';
import { Bot, User, AlertTriangle } from 'lucide-react';
import ChatLoadingIndicator from './ChatLoadingIndicator';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatMessageListProps {
  messages: ChatMessage[];
  isProcessing: boolean;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages, isProcessing }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isErrorMessage = (content: string) => {
    const errorPhrases = [
      'cannot answer without any document content',
      'i apologize',
      'i encountered an error',
      'failed to generate',
      'could not generate',
      'i\'m sorry',
      'technical error occurred'
    ];
    
    return errorPhrases.some(phrase => 
      content.toLowerCase().includes(phrase.toLowerCase())
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
        >
          <div className={`chat-bubble ${msg.role} ${
            msg.role === 'user' 
              ? 'bg-primary/10 text-primary-foreground' 
              : isErrorMessage(msg.content)
                ? 'bg-red-50 border border-red-200'
                : 'bg-card border'
          } p-3 rounded-lg max-w-[80%]`}>
            <div className="flex items-center gap-2 mb-1.5 text-xs opacity-70">
              {msg.role === 'ai' ? (
                <>
                  {isErrorMessage(msg.content) ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                  ) : (
                    <Bot className="h-3.5 w-3.5" />
                  )}
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
      ))}
      {isProcessing && <ChatLoadingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
