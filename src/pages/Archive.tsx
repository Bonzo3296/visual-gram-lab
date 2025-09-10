import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share, Calendar, ExternalLink, MessageSquare } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { 
  getAllProjects, 
  updateProjectApproval, 
  updateProjectFeedback,
  createShareableLink,
  type DatabaseProject 
} from "@/services/projectService";

export default function Archive() {
  const [projects, setProjects] = useState<DatabaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'post' | 'carousel' | 'reel'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i progetti",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalChange = async (projectId: string, approved: boolean) => {
    try {
      await updateProjectApproval(projectId, approved);
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, approved, approved_at: approved ? new Date().toISOString() : undefined } : p
      ));
      toast({
        title: approved ? "Progetto approvato" : "Approvazione rimossa",
        description: approved ? "Il progetto è stato approvato con successo" : "L'approvazione è stata rimossa",
      });
    } catch (error) {
      console.error('Error updating approval:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'approvazione",
        variant: "destructive",
      });
    }
  };

  const handleFeedbackUpdate = async (projectId: string, feedback: string) => {
    try {
      await updateProjectFeedback(projectId, feedback);
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, feedback } : p
      ));
      toast({
        title: "Feedback salvato",
        description: "Il feedback è stato salvato con successo",
      });
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare il feedback",
        variant: "destructive",
      });
    }
  };

  const copyShareLink = async (projectId: string) => {
    const link = createShareableLink(projectId);
    await navigator.clipboard.writeText(link);
    toast({
      title: "Link copiato",
      description: "Il link condivisibile è stato copiato negli appunti",
    });
  };

  const filteredProjects = projects.filter(project => {
    if (filter !== 'all' && project.type !== filter) return false;
    if (statusFilter === 'approved' && !project.approved) return false;
    if (statusFilter === 'pending' && project.approved) return false;
    return true;
  });

  const getProjectThumbnail = (project: DatabaseProject) => {
    if (project.type === 'reel' && project.cover?.src) {
      return project.cover.src;
    }
    if (project.media?.files && project.media.files.length > 0) {
      return project.media.files[0].src;
    }
    return "/placeholder.svg";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-ig-text-secondary">Caricamento archivio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Archivio Progetti</h1>
            <p className="text-ig-text-secondary mt-2">
              Gestisci tutti i tuoi contenuti, approva e programma le pubblicazioni
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <a href="/calendar">
                <Calendar className="h-4 w-4 mr-2" />
                Calendario
              </a>
            </Button>
            <Button asChild>
              <a href="/">
                Nuovo Progetto
              </a>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i tipi</SelectItem>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="carousel">Carosello</SelectItem>
                  <SelectItem value="reel">Reel</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  <SelectItem value="approved">Approvati</SelectItem>
                  <SelectItem value="pending">In attesa</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex-1" />
              
              <Badge variant="outline">
                {filteredProjects.length} progetti
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onApprovalChange={handleApprovalChange}
              onFeedbackUpdate={handleFeedbackUpdate}
              onCopyShareLink={copyShareLink}
            />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-ig-text-secondary">Nessun progetto trovato con i filtri selezionati</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

interface ProjectCardProps {
  project: DatabaseProject;
  onApprovalChange: (id: string, approved: boolean) => void;
  onFeedbackUpdate: (id: string, feedback: string) => void;
  onCopyShareLink: (id: string) => void;
}

function ProjectCard({ project, onApprovalChange, onFeedbackUpdate, onCopyShareLink }: ProjectCardProps) {
  const [feedback, setFeedback] = useState(project.feedback || '');
  const [showFeedback, setShowFeedback] = useState(false);

  const handleFeedbackSubmit = () => {
    onFeedbackUpdate(project.id, feedback);
    setShowFeedback(false);
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <div className="aspect-[4/5] bg-gray-100 overflow-hidden">
          <img
            src={getProjectThumbnail(project)}
            alt={project.title || 'Progetto'}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Project Type Badge */}
        <Badge 
          className="absolute top-2 left-2"
          variant={project.type === 'reel' ? 'default' : 'secondary'}
        >
          {project.type === 'post' ? 'Post' : project.type === 'carousel' ? 'Carosello' : 'Reel'}
        </Badge>

        {/* Approval Badge */}
        {project.approved && (
          <Badge className="absolute top-2 right-2 bg-green-500">
            ✓ Approvato
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg truncate">
              {project.title || `Progetto ${project.type}`}
            </h3>
            <p className="text-sm text-ig-text-secondary">
              {new Date(project.created_at).toLocaleDateString('it-IT')}
            </p>
          </div>

          {/* Approval Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`approve-${project.id}`}
              checked={project.approved}
              onCheckedChange={(checked) => onApprovalChange(project.id, checked as boolean)}
            />
            <label htmlFor={`approve-${project.id}`} className="text-sm font-medium">
              Approvato
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopyShareLink(project.id)}
              className="flex-1"
            >
              <Share className="h-4 w-4 mr-2" />
              Condividi
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFeedback(!showFeedback)}
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback
            </Button>

            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a href={`/p/${project.id}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Feedback Section */}
          {showFeedback && (
            <div className="space-y-2 pt-2 border-t">
              <Textarea
                placeholder="Aggiungi feedback o commenti..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-20"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleFeedbackSubmit}>
                  Salva
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setShowFeedback(false);
                    setFeedback(project.feedback || '');
                  }}
                >
                  Annulla
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getProjectThumbnail(project: DatabaseProject): string {
  if (project.type === 'reel' && project.cover?.src) {
    return project.cover.src;
  }
  if (project.media?.files && project.media.files.length > 0) {
    return project.media.files[0].src;
  }
  return "/placeholder.svg";
}