
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useAppContext } from '../context/useAppContext';
import { useDocuments } from '../hooks/useDocuments';
import DocumentViewer from './DocumentViewer';
import { Button } from '../components/ui/button';
import { MessageSquare, X } from 'lucide-react';
import ChatInterface from './ChatInterface';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentProject, currentDocument } = useAppContext();
  const [showProjectChat, setShowProjectChat] = useState(false);
  
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-background to-secondary/20">
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        <div className="p-6">
          {currentDocument ? <DocumentViewer /> : children}
        </div>
        
        {currentProject && !currentDocument && (
          <div className="fixed bottom-6 right-6">
            <Button 
              variant={showProjectChat ? "secondary" : "default"}
              size="icon"
              onClick={() => setShowProjectChat(!showProjectChat)}
              className="rounded-full h-12 w-12 shadow-lg"
            >
              {showProjectChat ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
            </Button>
          </div>
        )}
        
        {currentProject && !currentDocument && showProjectChat && (
          <div className="fixed bottom-20 right-6 w-[400px] h-[500px] bg-background rounded-lg shadow-xl border overflow-hidden animate-fade-in">
            <div className="h-full">
              <ChatInterface 
                projectId={currentProject.id}
                isProjectChat={true}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Layout;
