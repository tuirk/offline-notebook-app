import React, { useState } from 'react';
import Layout from '../components/Layout';
import ProjectCard from '../components/ProjectCard';
import FileUploader from '../components/FileUploader';
import DocumentViewer from '../components/DocumentViewer';
import { useProjects } from '../hooks/useProjects';
import { useDocuments } from '../hooks/useDocuments';
import { AppProvider } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { PlusCircle, Book, FileText, ChevronLeft, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import ChatInterface from '../components/ChatInterface';

const AppContent = () => {
  const { projects, currentProject, createProject, selectProject } = useProjects();
  const { documents, currentDocument } = useDocuments();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [showChat, setShowChat] = useState(true); // Chat shown by default

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim(), newProjectDescription.trim());
      setNewProjectName('');
      setNewProjectDescription('');
      setCreateDialogOpen(false);
    }
  };

  // Display document viewer if a document is selected
  if (currentDocument) {
    return <DocumentViewer />;
  }

  // Display project documents if a project is selected
  if (currentProject) {
    const projectDocs = documents.filter(doc => doc.projectId === currentProject.id);
    
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => selectProject(null)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-medium">{currentProject.name}</h1>
          </div>
          
          <Button 
            variant={showChat ? "secondary" : "outline"}
            onClick={() => setShowChat(!showChat)}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            {showChat ? "Hide Chat" : "Show Chat"}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat column - 2/3 of the screen */}
          <div className="lg:col-span-2">
            {showChat && (
              <div className="h-[600px]">
                <ChatInterface 
                  projectId={currentProject.id}
                  isProjectChat={true}
                />
              </div>
            )}
          </div>
          
          {/* Documents + Upload column - 1/3 of the screen */}
          <div className="lg:col-span-1 space-y-6">
            {/* Project Documents section */}
            <div>
              <h3 className="text-sm font-medium mb-3">Project Documents</h3>
              {projectDocs.length === 0 ? (
                <div className="text-center p-6 border border-dashed rounded-lg mb-6">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <h2 className="text-lg font-medium">No documents yet</h2>
                  <p className="text-muted-foreground text-sm mb-2">
                    Upload documents to analyze
                  </p>
                </div>
              ) : (
                <div className="space-y-2 mb-6">
                  {projectDocs.map(doc => (
                    <div
                      key={doc.id}
                      className="p-3 border rounded-lg hover:bg-muted/20 transition-colors cursor-pointer animate-fade-in flex items-center"
                      onClick={() => {
                        // Loading document content handled by the document viewer
                      }}
                    >
                      <div className={`file-icon ${doc.type} mr-2 h-8 w-8 flex items-center justify-center rounded`}>
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <h3 className="font-medium text-sm truncate">{doc.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {doc.type.toUpperCase()} • {new Date(doc.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* File Upload section */}
            <FileUploader />
            
            {/* Project Stats section */}
            {projectDocs.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Project Stats</h3>
                <div className="text-sm">
                  <p className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Documents:</span>
                    <span className="font-medium">{projectDocs.length}</span>
                  </p>
                  <p className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">{new Date(currentProject.createdAt).toLocaleDateString()}</span>
                  </p>
                  <p className="flex justify-between py-1.5">
                    <span className="text-muted-foreground">Last updated:</span>
                    <span className="font-medium">{new Date(currentProject.updatedAt).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Display projects list if no project is selected
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-medium">Your Projects</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>
      
      {projects.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <Book className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
          <h2 className="text-2xl font-medium">No projects yet</h2>
          <p className="text-muted-foreground mt-2 mb-8 max-w-md mx-auto">
            Create a project to organize your documents and analyze them with AI
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Your First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => {
            const docCount = documents.filter(d => d.projectId === project.id).length;
            return (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                description={project.description}
                documentCount={docCount}
                updatedAt={new Date(project.updatedAt)}
                onClick={() => selectProject(project)}
              />
            );
          })}
        </div>
      )}
      
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Project Name
              </label>
              <Input
                id="name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My Research"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
                id="description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="What's this project about?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Index = () => {
  return (
    <AppProvider>
      <Layout>
        <AppContent />
      </Layout>
    </AppProvider>
  );
};

export default Index;
