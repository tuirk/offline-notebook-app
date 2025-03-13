
import React from 'react';
import { Button } from '../ui/button';

interface ChatSuggestionsProps {
  isProjectChat: boolean;
  onSuggestionClick: (suggestion: string) => void;
}

const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({ isProjectChat, onSuggestionClick }) => {
  const getSuggestions = () => {
    if (isProjectChat) {
      return [
        "What are the main themes across all documents?",
        "Compare and contrast the documents in this project.",
        "What key insights can you extract from all documents?",
        "Summarize all documents in this project.",
      ];
    } else {
      return [
        "Can you summarize this document?",
        "What are the key points?",
        "Extract the main arguments.",
        "What recommendations does this document make?",
      ];
    }
  };

  return (
    <div className="px-4 pb-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {getSuggestions().map((suggestion, i) => (
          <Button
            key={i}
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ChatSuggestions;
