import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FeedPreview } from "@/components/preview/FeedPreview";
import { ReelPlayer } from "@/components/ReelPlayer";
import { getProjectById, addComment, getComments, type DatabaseProject, type Comment } from "@/services/projectService";
import type { Project } from "@/store/useProjectStore";
import { Loader2, ExternalLink, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Convert database project to local project format
function convertToLocalProject(dbProject: DatabaseProject): Project {
  return {
    id: dbProject.id,
    title: dbProject.title || `Progetto ${dbProject.type}`,
    type: dbProject.type,
    createdAt: new Date(dbProject.created_at).getTime(),
    updatedAt: new Date(dbProject.updated_at).getTime(),
    media: dbProject.media || { files: [], order: [] },
    render: dbProject.render || {
      fitMode: 'crop',
      zoom: 1,
      pan: { x: 0, y: 0 },
      blurBg: false,
      reel: { muted: false },
    },
    caption: {
      text: dbProject.caption || '',
      clampMode: '2lines',
    },
    profile: dbProject.profile || {
      username: 'utente_instagram',
      avatarSrc: undefined,
    },
    settings: dbProject.settings || {
      theme: 'light',
      language: 'it',
    },
  };
}

export default function PublicProject() {
  const { id, encodedData } = useParams<{ id: string; encodedData: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'feed' | 'detail' | 'grid' | 'reel'>('feed');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadProject() {
      // Check if this is a local project (has encodedData parameter)
      if (encodedData) {
        try {
          const projectData = JSON.parse(atob(encodedData));
          setProject(projectData);
          setComments([]); // No comments for local projects
        } catch (decodeError) {
          console.error('Error decoding local project:', decodeError);
          setError('Progetto locale non valido');
        }
        setLoading(false);
        return;
      }

      // Handle regular database projects
      if (!id) {
        setError('ID progetto mancante');
        setLoading(false);
        return;
      }

      try {
        const [dbProject, projectComments] = await Promise.all([
          getProjectById(id),
          getComments(id)
        ]);
        
        if (!dbProject) {
          setError('Progetto non trovato o rimosso');
        } else {
          const localProject = convertToLocalProject(dbProject);
          setProject(localProject);
          setComments(projectComments);
        }
      } catch (err) {
        console.error('Error loading project:', err);
        setError('Errore durante il caricamento del progetto');
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [id, encodedData]);

  const handleCommentSubmit = async () => {
    if (!id || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await addComment(id, newComment.trim(), 'client', authorName.trim() || undefined);
      const updatedComments = await getComments(id);
      setComments(updatedComments);
      setNewComment('');
      toast({
        title: "Commento inviato",
        description: "Il tuo feedback è stato inviato con successo",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare il commento",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-ig-text-secondary">Caricamento progetto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Contenuto non trovato</h1>
            <p className="text-ig-text-secondary mb-4">{error}</p>
            <Button asChild>
              <a href="/">
                <ExternalLink className="h-4 w-4 mr-2" />
                Crea il tuo progetto
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Anteprima Instagram</h1>
          <p className="text-ig-text-secondary">
            {project.title} • {project.type === 'post' ? 'Post' : project.type === 'carousel' ? 'Carosello' : 'Reel'}
          </p>
        </div>

        {/* Preview */}
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="feed">Feed</TabsTrigger>
                <TabsTrigger value="detail">Dettaglio</TabsTrigger>
                <TabsTrigger value="grid">Griglia</TabsTrigger>
                {project.type === 'reel' && <TabsTrigger value="reel">Reel</TabsTrigger>}
                {project.type !== 'reel' && <TabsTrigger value="reel" disabled>Reel</TabsTrigger>}
              </TabsList>

              <div className="mt-6">
                <TabsContent value="feed" className="mt-0">
                  <div className="flex justify-center">
                    <FeedPreview project={project} readOnly />
                  </div>
                </TabsContent>

                <TabsContent value="detail" className="mt-0">
                  <div className="flex justify-center">
                    <FeedPreview project={project} readOnly showDetails />
                  </div>
                </TabsContent>

                <TabsContent value="grid" className="mt-0">
                  <div className="grid grid-cols-3 gap-1 max-w-md mx-auto">
                    {Array.from({ length: 9 }, (_, i) => (
                      <div key={i} className="aspect-square bg-gray-100 rounded">
                        {i === 4 ? (
                          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                            <div className="w-8 h-8 bg-gray-300 rounded"></div>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gray-50 rounded"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reel" className="mt-0">
                  {project.type === 'reel' && project.media?.files?.[0]?.src ? (
                    <div className="flex justify-center">
                      <ReelPlayer 
                        src={project.media.files[0].src}
                        poster={project.media.cover?.src}
                        readOnly
                        className="max-w-sm"
                      />
                    </div>
                  ) : (
                    <div className="text-center p-8 text-ig-text-secondary">
                      {project.type === 'reel' ? 'Video non disponibile' : 'Disponibile solo per progetti Reel'}
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Comments Section - Only for database projects */}
        {!encodedData && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Feedback e Commenti</h3>
              </div>

            {/* Existing Comments */}
            <div className="space-y-4 mb-6">
              {comments.length === 0 ? (
                <p className="text-ig-text-secondary text-center py-4">
                  Nessun commento ancora. Lascia il primo feedback!
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-lg ${
                      comment.author_role === 'client' 
                        ? 'bg-blue-50 border-l-4 border-blue-200' 
                        : 'bg-gray-50 border-l-4 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">
                        {comment.author_name || (comment.author_role === 'client' ? 'Cliente' : 'Agenzia')}
                      </span>
                      <span className="text-xs text-ig-text-secondary">
                        {new Date(comment.created_at).toLocaleDateString('it-IT', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.body}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add New Comment */}
            <div className="space-y-3 pt-4 border-t">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Il tuo nome (opzionale)"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md"
                />
              </div>
              
              <Textarea
                placeholder="Lascia un feedback o commento su questo progetto..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-20"
              />
              
              <Button
                onClick={handleCommentSubmit}
                disabled={!newComment.trim() || submittingComment}
                className="w-full sm:w-auto"
              >
                {submittingComment ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Invia Feedback
              </Button>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <Button asChild variant="outline">
            <a href="/">
              <ExternalLink className="h-4 w-4 mr-2" />
              Crea il tuo progetto
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}