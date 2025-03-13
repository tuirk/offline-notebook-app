
import React, { useState } from 'react';
import Layout from '../components/Layout';
import ProjectCard from '../components/ProjectCard';
import FileUploader from '../components/FileUploader';
import DocumentViewer from '../components/DocumentViewer';
import { useProjects } from '../hooks/useProjects';
import { useDocuments } from '../hooks/useDocuments';
import { AppProvider } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { PlusCircle, Book, FileText, ChevronLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

const AppContent = () => {
  const { projects, currentProject, createProject, selectProject } = useProjects();
  const { documents, currentDocument } = useDocuments();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

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
        </div>
        
        {projectDocs.length === 0 ? (
          <div className="space-y-6">
            <div className="text-center p-12 border border-dashed rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium">No documents yet</h2>
              <p className="text-muted-foreground mt-1 mb-6">
                Upload documents to start analyzing them with AI
              </p>
            </div>
            <FileUploader />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectDocs.map(doc => (
                <div
                  key={doc.id}
                  className="p-4 border rounded-lg hover:bg-muted/20 transition-colors cursor-pointer animate-fade-in"
                  onClick={() => {
                    // Loading document content handled by the document viewer
                  }}
                >
                  <div className="flex items-center mb-2">
                    <div className={`file-icon ${doc.type} mr-3 h-10 w-10 flex items-center justify-center rounded`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{doc.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {doc.type.toUpperCase()} • {new Date(doc.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <FileUploader />
          </div>
        )}
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
