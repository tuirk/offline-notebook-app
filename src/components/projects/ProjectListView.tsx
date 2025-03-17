
import React, { useState } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { useDocuments } from '../../hooks/useDocuments';
import ProjectCard from '../ProjectCard';
import { Button } from '../ui/button';
import { PlusCircle, Book } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

const ProjectListView: React.FC = () => {
  const { projects, createProject, selectProject } = useProjects();
  const { documents } = useDocuments();
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

export default ProjectListView;
