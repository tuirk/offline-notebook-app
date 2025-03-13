
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

export interface AppState {
  projects: Project[];
  documents: Document[];
  currentProject: Project | null;
  currentDocument: Document | null;
  chatMessages: Record<string, ChatMessage[]>;
}
