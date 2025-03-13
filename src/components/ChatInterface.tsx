import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/useAppContext';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { generateAIResponse } from '../utils/aiUtils';
import { Send, Bot, User, Info } from 'lucide-react';
import { toast } from '../components/ui/use-toast';

interface ChatInterfaceProps {
  documentId?: string;
  documentContent?: string;
  projectId?: string;
  isProjectChat?: boolean;
  messages?: Array<{
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
  }>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  documentId, 
  documentContent,
  projectId,
  isProjectChat = false
}) => {
  const { addChatMessage, chatMessages, documents, currentProject } = useAppContext();
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatId = isProjectChat ? projectId : documentId;
  const displayMessages = chatId ? chatMessages[chatId] || [] : [];
  
  const projectDocuments = isProjectChat && projectId 
    ? documents.filter(doc => doc.projectId === projectId)
    : [];

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages]);

  useEffect(() => {
    if (displayMessages.length === 0) {
      toast({
        title: isProjectChat ? "Project Chat Ready" : "Document Chat Ready",
        description: isProjectChat 
          ? "Ask questions about all documents in this project." 
          : "Ask questions about this specific document.",
      });
    }
  }, [displayMessages.length, isProjectChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isProcessing || !chatId) return;
    
    const userMessage = message.trim();
    setMessage('');
    addChatMessage(chatId, 'user', userMessage);
    
    setIsProcessing(true);
    try {
      let contextContent = '';
      
      if (isProjectChat) {
        const docsWithContent = projectDocuments.filter(doc => doc.content);
        contextContent = docsWithContent
          .map(doc => `Document "${doc.name}": ${doc.content?.slice(0, 1000)}...`)
          .join('\n\n');
      } else if (documentContent) {
        contextContent = documentContent;
      }
      
      if (!contextContent) {
        addChatMessage(chatId, 'ai', 'I cannot answer without any document content. Please upload documents first.');
      } else {
        const aiResponse = await generateAIResponse(contextContent, userMessage);
        addChatMessage(chatId, 'ai', aiResponse);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      addChatMessage(chatId, 'ai', 'I apologize, but I encountered an error processing your request.');
      toast({
        title: "Error",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive"
      });
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
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-muted/10 shadow-sm">
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
              ? "Ask about all documents in this project" 
              : "Ask questions about this document"}
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Bot className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium">
              {isProjectChat 
                ? "Ask about this project" 
                : "Ask about this document"}
            </h3>
            <p className="max-w-sm mt-2">
              {isProjectChat
                ? "Use the chat to ask questions about all documents in this project."
                : "Use the chat to ask questions about the document content, request summaries, or extract key information."}
            </p>
          </div>
        ) : (
          displayMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              <div className={`chat-bubble ${msg.role} ${msg.role === 'user' ? 'bg-primary/10 text-primary-foreground' : 'bg-card border'} p-3 rounded-lg max-w-[80%]`}>
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
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {displayMessages.length === 0 && (
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
            placeholder={isProjectChat 
              ? "Ask a question about all documents in this project..." 
              : "Ask a question about this document..."}
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
