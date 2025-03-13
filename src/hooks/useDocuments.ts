
import { useCallback, useState } from 'react';
import { useAppContext, Document } from '../context/AppContext';
import { readFileAsText, readFileAsDataURL, extractTextFromPDF } from '../utils/fileUtils';

export function useDocuments() {
  const { 
    documents, 
    addDocument, 
    updateDocument, 
    deleteDocument, 
    currentDocument, 
    setCurrentDocument,
    currentProject
  } = useAppContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projectDocuments = currentProject 
    ? documents.filter(doc => doc.projectId === currentProject.id)
    : [];

  const uploadDocument = useCallback(async (file: File) => {
    if (!currentProject) {
      setError('No project selected');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const document = await addDocument(currentProject.id, file);
      return document;
    } catch (err) {
      setError('Failed to upload document');
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, addDocument]);

  const loadDocumentContent = useCallback(async (documentId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const doc = documents.find(d => d.id === documentId);
      
      if (!doc) {
        throw new Error('Document not found');
      }
      
      if (doc.content) {
        // Content already loaded
        setCurrentDocument(doc);
        return doc;
      }
      
      if (!doc.file) {
        throw new Error('Document file not available');
      }
      
      let content: string;
      
      if (doc.type === 'pdf') {
        // For PDFs, we'd normally use pdf.js to extract text
        // For this demo, we'll use a simplified approach
        const dataUrl = await readFileAsDataURL(doc.file);
        content = dataUrl; // Store data URL for rendering
      } else {
        // For text and markdown files
        content = await readFileAsText(doc.file);
      }
      
      const updatedDoc = { ...doc, content };
      await updateDocument(doc.id, { content });
      setCurrentDocument(updatedDoc);
      return updatedDoc;
    } catch (err: any) {
      setError(err.message || 'Failed to load document');
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [documents, setCurrentDocument, updateDocument]);

  const removeDocument = useCallback(async (id: string) => {
    await deleteDocument(id);
    if (currentDocument?.id === id) {
      setCurrentDocument(null);
    }
  }, [deleteDocument, currentDocument, setCurrentDocument]);

  return {
    documents: projectDocuments,
    currentDocument,
    isLoading,
    error,
    uploadDocument,
    loadDocumentContent,
    removeDocument,
    setCurrentDocument
  };
}
