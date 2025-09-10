import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveProject, createShareableLink } from "@/services/projectService";
import { useProjectStore } from "@/store/useProjectStore";

export function ShareButton() {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { currentProject, updateProject } = useProjectStore();

  const handleShare = async () => {
    if (!currentProject) return;

    setIsSharing(true);
    try {
      // Try to save project to Supabase first
      let projectId = currentProject.id;
      let shareableLink = '';
      
      if (!projectId || projectId.startsWith('project_')) {
        try {
          projectId = await saveProject(currentProject);
          // Update the local project with the new ID
          updateProject({ id: projectId });
          shareableLink = createShareableLink(projectId);
        } catch (saveError) {
          console.warn('Could not save to database, creating local share link:', saveError);
          // If saving fails, create a local share link with project data
          const projectData = btoa(JSON.stringify(currentProject));
          shareableLink = `${window.location.origin}/p/local/${projectData}`;
        }
      } else {
        shareableLink = createShareableLink(projectId);
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      
      toast({
        title: "Link copiato!",
        description: "Il link condivisibile è stato copiato negli appunti.",
      });

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error sharing project:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare il link condivisibile. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  if (!currentProject) return null;

  return (
    <Button
      onClick={handleShare}
      disabled={isSharing || currentProject.media.files.length === 0}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Share className="h-4 w-4" />
      )}
      {isSharing ? "Condivisione..." : copied ? "Copiato!" : "Condividi"}
    </Button>
  );
}