
import React from 'react';
import { useProjects } from '../../hooks/useProjects';
import { useDocuments } from '../../hooks/useDocuments';
import ProjectListView from './ProjectListView';
import ProjectDetailView from './ProjectDetailView';
import DocumentViewer from '../DocumentViewer';

const AppContent: React.FC = () => {
  const { currentProject } = useProjects();
  const { currentDocument } = useDocuments();

  // Display document viewer if a document is selected
  if (currentDocument) {
    return <DocumentViewer />;
  }

  // Display project details if a project is selected
  if (currentProject) {
    return <ProjectDetailView />;
  }

  // Display projects list if no project is selected
  return <ProjectListView />;
};

export default AppContent;
