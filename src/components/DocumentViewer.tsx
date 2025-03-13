
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { extractKeyTerms, analyzeDocument } from '../utils/aiUtils';
import { File, FileText, MessageSquare, Clock, ArrowLeft } from 'lucide-react';
import ChatInterface from './ChatInterface';
import { useDocuments } from '../hooks/useDocuments';
import { useAppContext } from '../context/AppContext';
import { readFileAsText } from '../utils/fileUtils';

const DocumentViewer: React.FC = () => {
  const { currentDocument, setCurrentDocument } = useDocuments();
  const { chatMessages } = useAppContext();
  const [activeTab, setActiveTab] = useState('document');
  const [documentAnalysis, setDocumentAnalysis] = useState<string | null>(null);
  const [keyTerms, setKeyTerms] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (currentDocument?.content && activeTab === 'insights' && !documentAnalysis) {
      analyzeCurrentDocument();
    }
  }, [currentDocument, activeTab, documentAnalysis]);

  const analyzeCurrentDocument = async () => {
    if (!currentDocument?.content) return;
    
    setIsAnalyzing(true);
    try {
      // For PDFs, we'd need to extract text first. This is simplified.
      let textContent = currentDocument.content;
      if (currentDocument.type === 'pdf' && currentDocument.file) {
        textContent = await readFileAsText(currentDocument.file);
      }
      
      const [analysis, terms] = await Promise.all([
        analyzeDocument(textContent),
        extractKeyTerms(textContent)
      ]);
      
      setDocumentAnalysis(analysis);
      setKeyTerms(terms);
    } catch (error) {
      console.error('Error analyzing document:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderDocumentContent = () => {
    if (!currentDocument?.content) {
      return <div className="text-muted-foreground">No content available</div>;
    }

    if (currentDocument.type === 'pdf') {
      return (
        <div className="w-full h-full min-h-[500px] rounded border">
          <iframe 
            src={currentDocument.content} 
            className="w-full h-full min-h-[500px]"
            title={currentDocument.name}
          />
        </div>
      );
    } else if (currentDocument.type === 'markdown') {
      // A simple markdown renderer would go here
      return (
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap font-sans">{currentDocument.content}</pre>
        </div>
      );
    } else {
      // Plain text
      return (
        <div className="font-mono text-sm whitespace-pre-wrap p-4 bg-muted/30 rounded">
          {currentDocument.content}
        </div>
      );
    }
  };

  const documentMessages = currentDocument 
    ? chatMessages[currentDocument.id] || [] 
    : [];

  if (!currentDocument) {
    return null;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => setCurrentDocument(null)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="file-icon mr-3">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-medium">{currentDocument.name}</h1>
            <p className="text-sm text-muted-foreground">
              {currentDocument.type.toUpperCase()} • {new Date(currentDocument.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="document" className="flex items-center">
            <File className="h-4 w-4 mr-2" />
            Document
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="document" className="mt-6">
          {renderDocumentContent()}
        </TabsContent>
        
        <TabsContent value="chat" className="mt-6">
          <ChatInterface 
            documentId={currentDocument.id} 
            documentContent={currentDocument.content || ''} 
            messages={documentMessages}
          />
        </TabsContent>
        
        <TabsContent value="insights" className="mt-6">
          <div className="space-y-6">
            <div className="p-4 border rounded-lg">
              <h3 className="text-lg font-medium mb-3">Document Analysis</h3>
              {isAnalyzing ? (
                <div className="text-muted-foreground">Analyzing document...</div>
              ) : documentAnalysis ? (
                <p className="whitespace-pre-line text-muted-foreground">{documentAnalysis}</p>
              ) : (
                <Button onClick={analyzeCurrentDocument}>Analyze Document</Button>
              )}
            </div>
            
            {keyTerms.length > 0 && (
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-3">Key Terms</h3>
                <div className="flex flex-wrap gap-2">
                  {keyTerms.map((term, index) => (
                    <div key={index} className="px-3 py-1 bg-secondary rounded-full text-sm">
                      {term}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentViewer;
