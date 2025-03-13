
import React from 'react';
import Sidebar from './Sidebar';
import { useAppContext } from '../context/AppContext';
import { useDocuments } from '../hooks/useDocuments';
import DocumentViewer from './DocumentViewer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentProject } = useAppContext();
  const { currentDocument } = useDocuments();
  
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-background to-secondary/20">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {currentDocument ? <DocumentViewer /> : children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
