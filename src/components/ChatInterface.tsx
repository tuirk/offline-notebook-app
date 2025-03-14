
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/useAppContext';
import { generateAIResponse } from '../utils/aiUtils';
import { documentEmbedder, textGenerator } from '../utils/ragUtils';
import { toast } from '../components/ui/use-toast';
import ChatHeader from './chat/ChatHeader';
import ChatMessageList from './chat/ChatMessageList';
import ChatInput from './chat/ChatInput';
import ChatSuggestions from './chat/ChatSuggestions';
import ChatEmptyState from './chat/ChatEmptyState';

interface ChatInterfaceProps {
  documentId?: string;
  documentContent?: string;
  projectId?: string;
  isProjectChat?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  documentId, 
  documentContent,
  projectId,
  isProjectChat = false
}) => {
  const { addChatMessage, chatMessages, documents } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelStatus, setModelStatus] = useState<string>('');
  const [documentProcessed, setDocumentProcessed] = useState(false);

  const chatId = isProjectChat ? projectId : documentId;
  const displayMessages = chatId ? chatMessages[chatId] || [] : [];
  
  // Only get documents for the current project
  const projectDocuments = isProjectChat && projectId 
    ? documents.filter(doc => doc.projectId === projectId)
    : [];

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

  // Check model loading status
  useEffect(() => {
    const checkModelStatus = () => {
      const embeddingInitializing = documentEmbedder.isInitializing();
      const generatorInitializing = textGenerator.isInitializing();
      const embeddingInitialized = documentEmbedder.isInitialized();
      const generatorInitialized = textGenerator.isInitialized();
      
      if (embeddingInitializing || generatorInitializing) {
        setModelStatus('Loading AI models...');
      } else if (embeddingInitialized && generatorInitialized) {
        setModelStatus('AI models loaded (using RAG)');
        setTimeout(() => setModelStatus(''), 3000); // Clear after 3 seconds
      } else {
        setModelStatus('');
      }
    };
    
    const interval = setInterval(checkModelStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Pre-process document content when available
  useEffect(() => {
    const processDocument = async () => {
      if (!documentContent || documentContent.length === 0 || documentProcessed) return;
      
      try {
        console.log("Pre-processing document content of length:", documentContent.length);
        await documentEmbedder.processDocument(documentContent);
        setDocumentProcessed(true);
        console.log("Document pre-processing complete");
      } catch (error) {
        console.error("Error pre-processing document:", error);
      }
    };
    
    processDocument();
  }, [documentContent, documentProcessed]);

  const handleSendMessage = async (userMessage: string) => {
    if (!chatId) return;
    
    addChatMessage(chatId, 'user', userMessage);
    
    setIsProcessing(true);
    try {
      let contextContent = '';
      
      if (isProjectChat) {
        // Only consider documents from the current project
        const docsWithContent = projectDocuments.filter(doc => doc.content);
        if (docsWithContent.length === 0) {
          addChatMessage(chatId, 'ai', 'I cannot answer without any document content. Please upload and open documents in this project first.');
          setIsProcessing(false);
          return;
        }
        
        contextContent = docsWithContent
          .map(doc => `Document "${doc.name}": ${doc.content?.slice(0, 1000)}...`)
          .join('\n\n');
      } else if (documentContent) {
        contextContent = documentContent;
      }
      
      if (!contextContent) {
        addChatMessage(chatId, 'ai', 'I cannot answer without any document content. Please upload documents first.');
      } else {
        console.log("Sending message with context length:", contextContent.length);
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

  const getInputPlaceholder = () => {
    return isProjectChat 
      ? `Ask a question about ${projectDocuments.length > 0 ? 'the ' + projectDocuments.length + ' document' + (projectDocuments.length !== 1 ? 's' : '') : 'documents'} in this project...` 
      : "Ask a question about this document...";
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-card shadow-sm">
      <ChatHeader 
        isProjectChat={isProjectChat} 
        documentsCount={projectDocuments.length} 
        modelStatus={modelStatus}
      />
      
      {displayMessages.length === 0 ? (
        <ChatEmptyState 
          isProjectChat={isProjectChat}
          documentsCount={projectDocuments.length}
        />
      ) : (
        <ChatMessageList 
          messages={displayMessages}
          isProcessing={isProcessing}
        />
      )}
      
      {displayMessages.length === 0 && (
        <ChatSuggestions 
          isProjectChat={isProjectChat}
          onSuggestionClick={(suggestion) => handleSendMessage(suggestion)}
        />
      )}
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        isProcessing={isProcessing}
        placeholder={getInputPlaceholder()}
      />
    </div>
  );
};

export default ChatInterface;
