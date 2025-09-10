import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectStore } from "@/store/useProjectStore";
import { Image, Images, Video } from "lucide-react";

export function ProjectTypeTabs() {
  const { currentProject, createProject } = useProjectStore();

  const handleTypeChange = (type: string) => {
    createProject(type as 'post' | 'carousel' | 'reel');
  };

  return (
    <div className="w-full">
      <Tabs
        value={currentProject?.type || 'post'}
        onValueChange={handleTypeChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger 
            value="post" 
            className="flex items-center gap-2 font-instagram text-sm data-[state=active]:bg-background data-[state=active]:text-ig-text-primary"
          >
            <Image className="h-4 w-4" />
            Post
          </TabsTrigger>
          <TabsTrigger 
            value="carousel" 
            className="flex items-center gap-2 font-instagram text-sm data-[state=active]:bg-background data-[state=active]:text-ig-text-primary"
          >
            <Images className="h-4 w-4" />
            Carosello
          </TabsTrigger>
          <TabsTrigger 
            value="reel" 
            className="flex items-center gap-2 font-instagram text-sm data-[state=active]:bg-background data-[state=active]:text-ig-text-primary"
          >
            <Video className="h-4 w-4" />
            Reel
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}