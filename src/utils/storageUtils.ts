
import { AppState, Project, Document, ChatMessage } from '../types';

export const loadStateFromStorage = (): Partial<AppState> => {
  try {
    const storedProjects = localStorage.getItem('projects');
    const storedDocuments = localStorage.getItem('documents');
    const storedChatMessages = localStorage.getItem('chatMessages');
    
    const state: Partial<AppState> = {};

    if (storedProjects) {
      const parsedProjects = JSON.parse(storedProjects);
      state.projects = parsedProjects.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }));
    }

    if (storedDocuments) {
      const parsedDocuments = JSON.parse(storedDocuments);
      state.documents = parsedDocuments.map((d: any) => ({
        ...d,
        createdAt: new Date(d.createdAt),
        updatedAt: new Date(d.updatedAt),
        file: null // File objects can't be stored in localStorage
      }));
    }

    if (storedChatMessages) {
      const parsedMessages = JSON.parse(storedChatMessages);
      const processedMessages: Record<string, ChatMessage[]> = {};
      
      Object.keys(parsedMessages).forEach(id => {
        processedMessages[id] = parsedMessages[id].map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      });
      
      state.chatMessages = processedMessages;
    }

    return state;
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    return {};
  }
};

export const saveProjectsToStorage = (projects: Project[]) => {
  localStorage.setItem('projects', JSON.stringify(projects));
};

export const saveDocumentsToStorage = (documents: Document[]) => {
  localStorage.setItem('documents', JSON.stringify(
    documents.map(d => ({
      ...d,
      file: null // File objects can't be stored in localStorage
    }))
  ));
};

export const saveChatMessagesToStorage = (chatMessages: Record<string, ChatMessage[]>) => {
  localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
};
