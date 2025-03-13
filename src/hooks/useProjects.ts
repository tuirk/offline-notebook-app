
import { useCallback } from 'react';
import { useAppContext, Project } from '../context/AppContext';

export function useProjects() {
  const { 
    projects, 
    addProject, 
    updateProject, 
    deleteProject, 
    currentProject, 
    setCurrentProject 
  } = useAppContext();

  const createProject = useCallback(async (name: string, description: string = '') => {
    const project = await addProject(name, description);
    return project;
  }, [addProject]);

  const renameProject = useCallback(async (id: string, newName: string) => {
    await updateProject(id, { name: newName });
  }, [updateProject]);

  const removeProject = useCallback(async (id: string) => {
    await deleteProject(id);
    if (currentProject?.id === id) {
      setCurrentProject(null);
    }
  }, [deleteProject, currentProject, setCurrentProject]);

  const selectProject = useCallback((project: Project | null) => {
    setCurrentProject(project);
  }, [setCurrentProject]);

  return {
    projects,
    currentProject,
    createProject,
    renameProject,
    removeProject,
    selectProject
  };
}
