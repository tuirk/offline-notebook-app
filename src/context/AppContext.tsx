
import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import { appReducer, initialState, AppAction } from './appReducer';
import { loadStateFromStorage, saveProjectsToStorage, saveDocumentsToStorage, saveChatMessagesToStorage } from '../utils/storageUtils';
import { Project, Document } from '../types';

// The context type includes both state and dispatch functions
type AppContextType = {
  projects: Project[];
  documents: Document[];
  currentProject: Project | null;
  currentDocument: Document | null;
  chatMessages: Record<string, { id: string; role: 'user' | 'ai'; content: string; timestamp: Date; }[]>;
  
  addProject: (name: string, description: string) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  
  addDocument: (projectId: string, file: File) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  setCurrentDocument: (document: Document | null) => void;
  
  addChatMessage: (projectId: string, role: 'user' | 'ai', content: string) => void;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on initial render
  useEffect(() => {
    const loadedState = loadStateFromStorage();
    if (Object.keys(loadedState).length > 0) {
      dispatch({ type: 'SET_STATE', payload: loadedState });
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveProjectsToStorage(state.projects);
  }, [state.projects]);

  useEffect(() => {
    saveDocumentsToStorage(state.documents);
  }, [state.documents]);

  useEffect(() => {
    saveChatMessagesToStorage(state.chatMessages);
  }, [state.chatMessages]);

  // Action creators
  const addProject = async (name: string, description: string): Promise<Project> => {
    dispatch({ type: 'ADD_PROJECT', payload: { name, description } });
    // Return the newly created project
    // Since we don't have the ID yet (created in reducer), we'll find it in the updated state
    return state.projects[state.projects.length - 1]; // This is a bit hacky but works for synchronous operations
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<void> => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { id, updates } });
  };

  const deleteProject = async (id: string): Promise<void> => {
    dispatch({ type: 'DELETE_PROJECT', payload: { id } });
  };

  const setCurrentProject = (project: Project | null) => {
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: { project } });
  };

  const addDocument = async (projectId: string, file: File): Promise<Document> => {
    dispatch({ type: 'ADD_DOCUMENT', payload: { projectId, file } });
    // Similar to addProject, return the newly created document
    return state.documents[state.documents.length - 1];
  };

  const updateDocument = async (id: string, updates: Partial<Document>): Promise<void> => {
    dispatch({ type: 'UPDATE_DOCUMENT', payload: { id, updates } });
  };

  const deleteDocument = async (id: string): Promise<void> => {
    dispatch({ type: 'DELETE_DOCUMENT', payload: { id } });
  };

  const setCurrentDocument = (document: Document | null) => {
    dispatch({ type: 'SET_CURRENT_DOCUMENT', payload: { document } });
  };

  const addChatMessage = (projectId: string, role: 'user' | 'ai', content: string) => {
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { projectId, role, content } });
  };

  const value: AppContextType = {
    ...state,
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
