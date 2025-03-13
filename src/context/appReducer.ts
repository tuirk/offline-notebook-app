
import { AppState, Project, Document, ChatMessage } from '../types';

export type AppAction =
  | { type: 'SET_STATE', payload: Partial<AppState> }
  | { type: 'ADD_PROJECT', payload: { name: string, description: string } }
  | { type: 'UPDATE_PROJECT', payload: { id: string, updates: Partial<Project> } }
  | { type: 'DELETE_PROJECT', payload: { id: string } }
  | { type: 'SET_CURRENT_PROJECT', payload: { project: Project | null } }
  | { type: 'ADD_DOCUMENT', payload: { projectId: string, file: File } }
  | { type: 'UPDATE_DOCUMENT', payload: { id: string, updates: Partial<Document> } }
  | { type: 'DELETE_DOCUMENT', payload: { id: string } }
  | { type: 'SET_CURRENT_DOCUMENT', payload: { document: Document | null } }
  | { type: 'ADD_CHAT_MESSAGE', payload: { projectId: string, role: 'user' | 'ai', content: string } };

export const initialState: AppState = {
  projects: [],
  documents: [],
  currentProject: null,
  currentDocument: null,
  chatMessages: {},
};

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    
    case 'ADD_PROJECT': {
      const newProject: Project = {
        id: crypto.randomUUID(),
        name: action.payload.name,
        description: action.payload.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return {
        ...state,
        projects: [...state.projects, newProject]
      };
    }
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project => 
          project.id === action.payload.id 
            ? { ...project, ...action.payload.updates, updatedAt: new Date() } 
            : project
        )
      };
    
    case 'DELETE_PROJECT': {
      const newState = {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload.id),
        documents: state.documents.filter(doc => doc.projectId !== action.payload.id),
      };
      
      // Also delete chat messages for this project
      if (state.chatMessages[action.payload.id]) {
        const newChatMessages = { ...state.chatMessages };
        delete newChatMessages[action.payload.id];
        newState.chatMessages = newChatMessages;
      }
      
      return newState;
    }
    
    case 'SET_CURRENT_PROJECT':
      return {
        ...state,
        currentProject: action.payload.project
      };
    
    case 'ADD_DOCUMENT': {
      // Determine document type based on file extension
      const file = action.payload.file;
      const extension = file.name.split('.').pop()?.toLowerCase();
      let type: 'pdf' | 'text' | 'markdown' = 'text';
      
      if (extension === 'pdf') {
        type = 'pdf';
      } else if (extension === 'md' || extension === 'markdown') {
        type = 'markdown';
      }
      
      const newDocument: Document = {
        id: crypto.randomUUID(),
        projectId: action.payload.projectId,
        name: file.name,
        type,
        content: null, // Will be populated when viewed
        size: file.size,
        file, // Store the actual file temporarily
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return {
        ...state,
        documents: [...state.documents, newDocument]
      };
    }
    
    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map(doc => 
          doc.id === action.payload.id 
            ? { ...doc, ...action.payload.updates, updatedAt: new Date() } 
            : doc
        )
      };
    
    case 'DELETE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter(doc => doc.id !== action.payload.id)
      };
    
    case 'SET_CURRENT_DOCUMENT':
      return {
        ...state,
        currentDocument: action.payload.document
      };
    
    case 'ADD_CHAT_MESSAGE': {
      const newMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: action.payload.role,
        content: action.payload.content,
        timestamp: new Date(),
      };
      
      return {
        ...state,
        chatMessages: {
          ...state.chatMessages,
          [action.payload.projectId]: [
            ...(state.chatMessages[action.payload.projectId] || []),
            newMessage
          ]
        }
      };
    }
    
    default:
      return state;
  }
};
