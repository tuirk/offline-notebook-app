
import React from 'react';
import { Bot, Info } from 'lucide-react';

interface ChatHeaderProps {
  isProjectChat: boolean;
  documentsCount: number;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ isProjectChat, documentsCount }) => {
  return (
    <div className="bg-primary/5 py-2 px-4 border-b flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Bot className="h-4 w-4 text-primary" />
        <h3 className="font-medium">
          {isProjectChat ? "Project Assistant" : "Document Assistant"}
        </h3>
      </div>
      <div className="flex items-center text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5 mr-1" />
        <span>
          {isProjectChat 
            ? `Ask about ${documentsCount} document${documentsCount !== 1 ? 's' : ''} in this project` 
            : "Ask questions about this document"}
        </span>
      </div>
    </div>
  );
};

export default ChatHeader;
