import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReelPlayerProps {
  src: string;
  poster?: string;
  readOnly?: boolean;
  className?: string;
}

export function ReelPlayer({ src, poster, readOnly = false, className = "" }: ReelPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <div className={`relative w-full aspect-[9/16] bg-black overflow-hidden rounded-2xl ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        autoPlay={!readOnly}
        muted={isMuted}
        loop
        className="absolute inset-0 h-full w-full object-cover"
        onClick={togglePlay}
      />
      
      {/* Overlay Controls */}
      {!readOnly && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/20">
          <Button
            variant="outline"
            size="icon"
            onClick={togglePlay}
            className="mb-4 bg-white/20 border-white/30 hover:bg-white/30"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 text-white" />
            ) : (
              <Play className="h-6 w-6 text-white" />
            )}
          </Button>
        </div>
      )}

      {/* Mute/Unmute Control */}
      <div className="absolute bottom-4 right-4">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMute}
          className="bg-white/20 border-white/30 hover:bg-white/30"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4 text-white" />
          ) : (
            <Volume2 className="h-4 w-4 text-white" />
          )}
        </Button>
      </div>

      {/* Instagram-like UI Overlay */}
      {readOnly && (
        <div className="absolute right-4 bottom-20 flex flex-col gap-4">
          {/* Like button */}
          <div className="flex flex-col items-center text-white">
            <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-sm">♥</span>
            </div>
            <span className="text-xs mt-1">12.5k</span>
          </div>
          
          {/* Comment button */}
          <div className="flex flex-col items-center text-white">
            <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-sm">💬</span>
            </div>
            <span className="text-xs mt-1">834</span>
          </div>
          
          {/* Share button */}
          <div className="flex flex-col items-center text-white">
            <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-sm">📤</span>
            </div>
            <span className="text-xs mt-1">Share</span>
          </div>
        </div>
      )}
    </div>
  );
}