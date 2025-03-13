
import React from 'react';
import { Bot } from 'lucide-react';

const ChatLoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start animate-pulse">
      <div className="chat-bubble ai bg-card border p-3 rounded-lg">
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
  );
};

export default ChatLoadingIndicator;
