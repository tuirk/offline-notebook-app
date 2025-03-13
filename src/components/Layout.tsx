
import React from 'react';
import Sidebar from './Sidebar';
import { useAppContext } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentProject } = useAppContext();
  
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-background to-secondary/20">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
