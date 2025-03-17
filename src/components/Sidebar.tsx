
import React, { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useDocuments } from '../hooks/useDocuments';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { PlusCircle, FolderOpen, File, ChevronRight, ChevronDown, Settings, ChevronLeft } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { projects, currentProject, createProject, selectProject, removeProject } = useProjects();
  const { documents, loadDocumentContent, currentDocument } = useDocuments();
  
  const [isOpen, setIsOpen] = useState(true);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const toggleProjectExpand = (projectId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim(), newProjectDescription.trim());
      setNewProjectName('');
      setNewProjectDescription('');
      setProjectDialogOpen(false);
    }
  };

  const handleSelectDocument = (documentId: string) => {
    loadDocumentContent(documentId);
  };

  return (
    <>
      <aside className={`h-screen bg-card border-r border-border transition-all duration-300 flex flex-col ${isOpen ? 'w-64' : 'w-16'}`}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h1 className={`font-medium transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
            Notebookish
          </h1>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-full p-1.5 hover:bg-muted transition-colors"
          >
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2">
          <div className="flex items-center justify-between px-4 py-2">
            <span className={`text-xs font-medium text-muted-foreground transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
              PROJECTS
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-full"
              onClick={() => setProjectDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-1 px-3">
            {projects.map(project => (
              <div key={project.id} className="animate-fade-in">
                <div 
                  className={`flex items-center px-2 py-1.5 rounded-md cursor-pointer 
                    ${currentProject?.id === project.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                  onClick={() => selectProject(project)}
                >
                  <button
                    className="mr-1 p-0.5 rounded hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleProjectExpand(project.id);
                    }}
                  >
                    {expandedProjects[project.id] ? 
                      <ChevronDown className="h-3 w-3" /> : 
                      <ChevronRight className="h-3 w-3" />
                    }
                  </button>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  <span className={`truncate transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                    {project.name}
                  </span>
                </div>
                
                {expandedProjects[project.id] && isOpen && (
                  <div className="ml-8 mt-1 space-y-1">
                    {documents
                      .filter(doc => doc.projectId === project.id)
                      .map(doc => (
                        <div
                          key={doc.id}
                          className={`flex items-center px-2 py-1.5 text-sm rounded-md cursor-pointer
                            ${currentDocument?.id === doc.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                          onClick={() => handleSelectDocument(doc.id)}
                        >
                          <File className="mr-2 h-3.5 w-3.5" />
                          <span className="truncate">{doc.name}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-auto border-t border-border p-4">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
              Settings
            </span>
          </Button>
        </div>
      </aside>
      
      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
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
            <Button variant="outline" onClick={() => setProjectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Sidebar;
