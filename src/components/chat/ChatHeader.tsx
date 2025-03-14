
import React from 'react';
import { MessageSquareText } from 'lucide-react';

interface ChatHeaderProps {
  isProjectChat: boolean;
  documentsCount: number;
  modelStatus?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  isProjectChat, 
  documentsCount,
  modelStatus 
}) => {
  return (
    <div className="p-4 border-b flex items-center justify-between">
      <div className="flex items-center gap-2">
        <MessageSquareText className="h-5 w-5 text-primary" />
        <div>
          <h3 className="font-medium">
            {isProjectChat ? 'Project Chat' : 'Document Chat'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isProjectChat 
              ? `AI assistant for ${documentsCount} document${documentsCount !== 1 ? 's' : ''}` 
              : 'AI assistant for this document'}
          </p>
        </div>
      </div>
      
      {modelStatus && (
        <div className="text-xs px-2 py-1 bg-secondary/50 rounded-full animate-pulse">
          {modelStatus}
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
