import { useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { ProjectTypeTabs } from "@/components/ProjectTypeTabs";
import { UploaderPanel } from "@/components/UploaderPanel";
import { CaptionPanel } from "@/components/CaptionPanel";
import { PreviewPanel } from "@/components/preview/PreviewPanel";
import { ProjectBar } from "@/components/ProjectBar";
import { useProjectStore } from "@/store/useProjectStore";

const Index = () => {
  const { currentProject, createProject } = useProjectStore();

  // Initialize a default project on mount if none exists
  useEffect(() => {
    if (!currentProject) {
      createProject('post');
    }
  }, [currentProject, createProject]);

  return (
    <div className="min-h-screen bg-background font-instagram">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Project Type Selection */}
          <div className="w-full max-w-md mx-auto">
            <ProjectTypeTabs />
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Controls */}
            <div className="space-y-6">
              <UploaderPanel />
              <CaptionPanel />
              <ProjectBar />
            </div>

            {/* Right Column - Preview */}
            <div className="sticky top-20">
              <PreviewPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
