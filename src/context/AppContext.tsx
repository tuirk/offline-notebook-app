
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  projectId: string;
  name: string;
  type: 'pdf' | 'text' | 'markdown';
  content: string | null;
  size: number;
  file: File | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AppContextType {
  projects: Project[];
  documents: Document[];
  currentProject: Project | null;
  currentDocument: Document | null;
  chatMessages: Record<string, ChatMessage[]>;
  
  addProject: (name: string, description: string) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  
  addDocument: (projectId: string, file: File) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  setCurrentDocument: (document: Document | null) => void;
  
  addChatMessage: (documentId: string, role: 'user' | 'ai', content: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem('projects');
      const storedDocuments = localStorage.getItem('documents');
      const storedChatMessages = localStorage.getItem('chatMessages');

      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects);
        setProjects(parsedProjects.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        })));
      }

      if (storedDocuments) {
        const parsedDocuments = JSON.parse(storedDocuments);
        setDocuments(parsedDocuments.map((d: any) => ({
          ...d,
          createdAt: new Date(d.createdAt),
          updatedAt: new Date(d.updatedAt),
          file: null // File objects can't be stored in localStorage
        })));
      }

      if (storedChatMessages) {
        const parsedMessages = JSON.parse(storedChatMessages);
        const processedMessages: Record<string, ChatMessage[]> = {};
        
        Object.keys(parsedMessages).forEach(docId => {
          processedMessages[docId] = parsedMessages[docId].map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }));
        });
        
        setChatMessages(processedMessages);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('documents', JSON.stringify(
      documents.map(d => ({
        ...d,
        file: null // File objects can't be stored in localStorage
      }))
    ));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  const addProject = async (name: string, description: string): Promise<Project> => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<void> => {
    setProjects(prev => prev.map(project => 
      project.id === id ? { ...project, ...updates, updatedAt: new Date() } : project
    ));
  };

  const deleteProject = async (id: string): Promise<void> => {
    setProjects(prev => prev.filter(project => project.id !== id));
    // Also delete all documents in this project
    setDocuments(prev => prev.filter(doc => doc.projectId !== id));
  };

  const addDocument = async (projectId: string, file: File): Promise<Document> => {
    // Determine document type based on file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    let type: 'pdf' | 'text' | 'markdown' = 'text';
    
    if (extension === 'pdf') {
      type = 'pdf';
    } else if (extension === 'md' || extension === 'markdown') {
      type = 'markdown';
    }
    
    // We'd normally process the file here, but for now we'll just store it
    const newDocument: Document = {
      id: crypto.randomUUID(),
      projectId,
      name: file.name,
      type,
      content: null, // Will be populated when viewed
      size: file.size,
      file, // Store the actual file temporarily
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setDocuments(prev => [...prev, newDocument]);
    return newDocument;
  };

  const updateDocument = async (id: string, updates: Partial<Document>): Promise<void> => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, ...updates, updatedAt: new Date() } : doc
    ));
  };

  const deleteDocument = async (id: string): Promise<void> => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    // Also delete all chat messages for this document
    if (chatMessages[id]) {
      const newChatMessages = { ...chatMessages };
      delete newChatMessages[id];
      setChatMessages(newChatMessages);
    }
  };

  const addChatMessage = (documentId: string, role: 'user' | 'ai', content: string) => {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date(),
    };
    
    setChatMessages(prev => ({
      ...prev,
      [documentId]: [...(prev[documentId] || []), newMessage],
    }));
  };

  const value: AppContextType = {
    projects,
    documents,
    currentProject,
    currentDocument,
    chatMessages,
    addProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    addDocument,
    updateDocument,
    deleteDocument,
    setCurrentDocument,
    addChatMessage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
