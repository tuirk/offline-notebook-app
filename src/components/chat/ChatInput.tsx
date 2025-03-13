
import React, { useState } from 'react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  placeholder: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isProcessing, placeholder }) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (!message.trim() || isProcessing) return;
    onSendMessage(message.trim());
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 border-t bg-card">
      <div className="flex items-end gap-2">
        <Textarea
          placeholder={placeholder}
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
  );
};

export default ChatInput;
