import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Save, FolderOpen, Copy } from "lucide-react";
import { useProjectStore } from "@/store/useProjectStore";
import { ShareButton } from "./ShareButton";

export function ProjectBar() {
  const { currentProject, saveProject } = useProjectStore();

  const handleSave = () => {
    if (currentProject) {
      saveProject();
    }
  };

  const duplicateProject = () => {
    if (currentProject) {
      // Create a copy with new ID and timestamp
      const duplicatedProject = {
        ...currentProject,
        id: `project_${Date.now()}`,
        title: `${currentProject.title} (copia)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      // This would need to be implemented in the store
      console.log('Duplicate project:', duplicatedProject);
    }
  };

  return (
    <Card className="border-ig-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={!currentProject}
              size="sm"
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Salva
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={!currentProject}
            >
              <FolderOpen className="h-4 w-4" />
              Carica
            </Button>
            
            <Button
              onClick={duplicateProject}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={!currentProject}
            >
              <Copy className="h-4 w-4" />
              Duplica
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <a href="/archive">Archivio</a>
            </Button>
            <ShareButton />
          </div>
        </div>

        {currentProject && (
          <div className="mt-3 pt-3 border-t border-ig-border">
            <p className="text-sm text-ig-text-secondary">
              <span className="font-medium">{currentProject.title}</span>
              {' • '}
              <span className="capitalize">{currentProject.type}</span>
              {' • '}
              {currentProject.media.files.length} file
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}