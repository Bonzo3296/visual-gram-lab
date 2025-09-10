import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/useProjectStore";
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface FeedPreviewProps {
  project?: import("@/store/useProjectStore").Project;
  readOnly?: boolean;
  showDetails?: boolean;
}

export function FeedPreview({ project: externalProject, readOnly = false, showDetails = false }: FeedPreviewProps) {
  const { currentProject } = useProjectStore();
  const project = externalProject || currentProject;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  if (!project || project.media.files.length === 0) {
    return (
      <Card className="w-full max-w-sm mx-auto bg-background border-ig-border">
        <div className="aspect-[4/5] bg-muted flex items-center justify-center">
          <p className="text-ig-text-secondary font-instagram">
            Carica dei file per vedere l'anteprima
          </p>
        </div>
      </Card>
    );
  }

  const files = project.media.files;
  const isCarousel = project.type === 'carousel' && files.length > 1;
  const isReel = project.type === 'reel';
  
  // Get current file for display
  const currentFile = files[currentSlide] || files[0];
  
  // Format caption for display
  const formatCaption = (text: string) => {
    return text
      .replace(/\n/g, '<br>')
      .replace(/#(\w+)/g, '<span class="text-ig-primary font-medium">#$1</span>')
      .replace(/@(\w+)/g, '<span class="text-ig-primary font-medium">@$1</span>');
  };

  const truncateCaption = (text: string, mode: '2lines' | '125chars') => {
    if (mode === '125chars') {
      return text.length > 125 ? text.substring(0, 125) : text;
    }
    // For 2lines mode, we'll use CSS to handle the truncation
    return text;
  };

  const shouldShowMore = (text: string, mode: '2lines' | '125chars') => {
    if (mode === '125chars') {
      return text.length > 125;
    }
    // For 2lines, we'll assume it needs truncation if it's longer than ~100 chars
    return text.length > 100;
  };

  const nextSlide = () => {
    if (isCarousel) {
      setCurrentSlide((prev) => (prev + 1) % files.length);
    }
  };

  const prevSlide = () => {
    if (isCarousel) {
      setCurrentSlide((prev) => (prev - 1 + files.length) % files.length);
    }
  };

  // Mock data
  const mockLikes = Math.floor(Math.random() * 10000) + 100;
  const mockUsername = project.profile.username;
  const mockTime = "2 ore fa";

  return (
    <div ref={feedRef} className="w-full max-w-sm mx-auto">
      <Card className="bg-background border-ig-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-ig-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-ig-gradient flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {mockUsername.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-ig-text-primary font-instagram">
                {mockUsername}
              </span>
              <span className="text-xs text-ig-text-secondary font-instagram">
                {mockTime}
              </span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="text-ig-text-secondary hover:text-ig-text-primary h-8 w-8"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Media Container */}
        <div className="relative aspect-[4/5] bg-muted overflow-hidden">
          {/* Media Display */}
          {isReel ? (
            // For reel in feed, show cover image (4:5 crop from 9:16)
            <div className="w-full h-full bg-black flex items-center justify-center">
              {currentFile.type === 'video' ? (
                <video
                  src={currentFile.src}
                  className="w-full h-full object-cover"
                  muted
                  poster={project.media.cover?.src}
                />
              ) : (
                <img
                  src={currentFile.src}
                  alt="Reel cover"
                  className="w-full h-full object-cover"
                />
              )}
              {/* Reel play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[6px] border-y-transparent ml-1" />
                </div>
              </div>
            </div>
          ) : (
            // Regular post or carousel
            <>
              {currentFile.type === 'image' ? (
                <img
                  src={currentFile.src}
                  alt={`Slide ${currentSlide + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={currentFile.src}
                  className="w-full h-full object-cover"
                  muted
                  poster={project.media.cover?.src}
                />
              )}
            </>
          )}

          {/* Carousel Navigation */}
          {isCarousel && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white h-8 w-8 rounded-full"
                onClick={prevSlide}
                disabled={readOnly}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white h-8 w-8 rounded-full"
                onClick={nextSlide}
                disabled={readOnly}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              {/* Slide indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1">
                {files.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentSlide ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
              
              {/* Slide counter */}
              <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-instagram">
                {currentSlide + 1}/{files.length}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${isLiked ? 'text-ig-heart' : 'text-ig-text-primary'} hover:text-ig-text-secondary`}
                onClick={() => !readOnly && setIsLiked(!isLiked)}
                disabled={readOnly}
              >
                <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-ig-text-primary hover:text-ig-text-secondary h-8 w-8"
              >
                <MessageCircle className="h-6 w-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-ig-text-primary hover:text-ig-text-secondary h-8 w-8"
              >
                <Send className="h-6 w-6" />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isSaved ? 'text-ig-text-primary' : 'text-ig-text-primary'} hover:text-ig-text-secondary`}
                onClick={() => !readOnly && setIsSaved(!isSaved)}
                disabled={readOnly}
            >
              <Bookmark className={`h-6 w-6 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Likes */}
          <div className="text-sm font-semibold text-ig-text-primary font-instagram">
            {mockLikes.toLocaleString('it-IT')} Mi piace
          </div>

          {/* Caption */}
          {project.caption.text && (
            <div className="text-sm font-instagram">
              <span className="font-semibold text-ig-text-primary mr-2">
                {mockUsername}
              </span>
              
              {showFullCaption ? (
                <span
                  className="text-ig-text-primary"
                    dangerouslySetInnerHTML={{
                      __html: formatCaption(project.caption.text)
                    }}
                />
              ) : (
                <>
                  <span
                    className={`text-ig-text-primary ${
                      project.caption.clampMode === '2lines' 
                        ? 'line-clamp-2' 
                        : ''
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: formatCaption(
                        truncateCaption(
                          project.caption.text, 
                          project.caption.clampMode
                        )
                      )
                    }}
                  />
                  
                  {shouldShowMore(project.caption.text, project.caption.clampMode) && (
                    <button
                      onClick={() => setShowFullCaption(true)}
                      className="text-ig-text-secondary hover:text-ig-text-primary ml-1"
                      disabled={readOnly}
                    >
                      ... altro
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* View comments */}
          <button className="text-sm text-ig-text-secondary hover:text-ig-text-primary font-instagram">
            Visualizza tutti i {Math.floor(Math.random() * 50) + 5} commenti
          </button>

          {/* Time */}
          <div className="text-xs text-ig-text-tertiary font-instagram uppercase">
            {mockTime}
          </div>
        </div>
      </Card>
    </div>
  );
}