
import React from 'react';
import { Bot } from 'lucide-react';

interface ChatEmptyStateProps {
  isProjectChat: boolean;
  documentsCount: number;
}

const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ isProjectChat, documentsCount }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
      <Bot className="h-12 w-12 mb-4" />
      <h3 className="text-lg font-medium">
        {isProjectChat 
          ? "Ask about this project" 
          : "Ask about this document"}
      </h3>
      <p className="max-w-sm mt-2">
        {isProjectChat
          ? `Ask questions about ${documentsCount > 0 ? 'the ' + documentsCount + ' document' + (documentsCount !== 1 ? 's' : '') : 'documents'} in this project.`
          : "Ask questions about the document content, request summaries, or extract key information."}
      </p>
    </div>
  );
};

export default ChatEmptyState;
