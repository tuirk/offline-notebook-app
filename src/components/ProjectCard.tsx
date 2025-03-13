
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { FolderOpen, FileText, MoreHorizontal } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../components/ui/dropdown-menu';
import { useProjects } from '../hooks/useProjects';

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  updatedAt: Date;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  name,
  description,
  documentCount,
  updatedAt,
  onClick
}) => {
  const { removeProject } = useProjects();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-medium">{name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => removeProject(id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent onClick={onClick} className="pb-2 cursor-pointer">
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {description || "No description provided"}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center">
            <FolderOpen className="mr-1 h-3.5 w-3.5" />
            1 Project
          </span>
          <span className="flex items-center">
            <FileText className="mr-1 h-3.5 w-3.5" />
            {documentCount} {documentCount === 1 ? 'File' : 'Files'}
          </span>
        </div>
        <span>
          Updated {formatDistanceToNow(updatedAt, { addSuffix: true })}
        </span>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
