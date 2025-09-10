import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectStore } from "@/store/useProjectStore";
import { Home, Maximize2, Grid3X3, Play } from "lucide-react";

export function PreviewTabs() {
  const { activeTab, setActiveTab, currentProject } = useProjectStore();

  const isReel = currentProject?.type === 'reel';

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
      <TabsList className="grid w-full grid-cols-4 bg-muted/50">
        <TabsTrigger 
          value="feed" 
          className="flex items-center gap-2 font-instagram text-sm data-[state=active]:bg-background data-[state=active]:text-ig-text-primary"
        >
          <Home className="h-4 w-4" />
          Feed
        </TabsTrigger>
        <TabsTrigger 
          value="detail" 
          className="flex items-center gap-2 font-instagram text-sm data-[state=active]:bg-background data-[state=active]:text-ig-text-primary"
        >
          <Maximize2 className="h-4 w-4" />
          Dettaglio
        </TabsTrigger>
        <TabsTrigger 
          value="grid" 
          className="flex items-center gap-2 font-instagram text-sm data-[state=active]:bg-background data-[state=active]:text-ig-text-primary"
        >
          <Grid3X3 className="h-4 w-4" />
          Griglia
        </TabsTrigger>
        <TabsTrigger 
          value="reel" 
          disabled={!isReel}
          className="flex items-center gap-2 font-instagram text-sm data-[state=active]:bg-background data-[state=active]:text-ig-text-primary disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          Reel
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}