import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/useProjectStore";
import { PreviewTabs } from "./PreviewTabs";
import { FeedPreview } from "./FeedPreview";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";

export function PreviewPanel() {
  const { currentProject, activeTab } = useProjectStore();

  const exportPreview = async () => {
    const previewElement = document.querySelector(`[data-preview="${activeTab}"]`);
    if (!previewElement) return;

    try {
      const canvas = await html2canvas(previewElement as HTMLElement, {
        scale: 2,
        backgroundColor: activeTab === 'reel' ? '#000000' : '#ffffff',
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `instagram-preview-${activeTab}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error exporting preview:', error);
    }
  };

  if (!currentProject) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-ig-text-secondary text-center font-instagram">
            Crea un progetto per vedere l'anteprima
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-ig-text-primary font-instagram">
            Anteprima Instagram
          </CardTitle>
          
          <Button
            onClick={exportPreview}
            size="sm"
            className="bg-ig-primary hover:bg-ig-primary/90 text-white font-instagram"
            disabled={currentProject.media.files.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Esporta PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <PreviewTabs />
        
        <div className="min-h-[600px] flex items-start justify-center">
          {activeTab === 'feed' && (
            <div data-preview="feed">
              <FeedPreview />
            </div>
          )}
          
          {activeTab === 'detail' && (
            <div data-preview="detail" className="w-full max-w-md mx-auto">
              <Card className="bg-background border-ig-border">
                <CardContent className="p-6">
                  <p className="text-ig-text-secondary text-center font-instagram">
                    Vista dettaglio - In sviluppo
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === 'grid' && (
            <div data-preview="grid" className="w-full max-w-md mx-auto">
              <Card className="bg-background border-ig-border">
                <CardContent className="p-6">
                  <p className="text-ig-text-secondary text-center font-instagram">
                    Vista griglia profilo - In sviluppo
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === 'reel' && (
            <div data-preview="reel" className="w-full max-w-md mx-auto">
              <Card className="bg-black border-ig-border">
                <CardContent className="p-6">
                  <p className="text-white text-center font-instagram">
                    Vista Reel full-screen - In sviluppo
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}