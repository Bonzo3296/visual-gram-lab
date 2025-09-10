import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useProjectStore } from "@/store/useProjectStore";
import { Upload, X, Image as ImageIcon, Video, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function UploaderPanel() {
  const { currentProject, addMedia, removeMedia, isUploading } = useProjectStore();
  const [dragActive, setDragActive] = useState(false);

  const getAcceptedFiles = () => {
    if (!currentProject?.type) return {};
    
    switch (currentProject.type) {
      case 'post':
      case 'carousel':
        return {
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/png': ['.png'],
          'image/webp': ['.webp']
        };
      case 'reel':
        return {
          'video/mp4': ['.mp4'],
          'video/quicktime': ['.mov']
        };
      default:
        return {};
    }
  };

  const getMaxFiles = () => {
    if (!currentProject?.type) return 1;
    return currentProject.type === 'carousel' ? 10 : 1;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      addMedia(acceptedFiles);
    }
  }, [addMedia]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: getAcceptedFiles(),
    maxFiles: getMaxFiles(),
    disabled: isUploading,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  if (!currentProject) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-ig-text-secondary text-sm font-instagram">
            Seleziona un tipo di progetto per iniziare
          </p>
        </CardContent>
      </Card>
    );
  }

  const isVideo = currentProject.type === 'reel';
  const hasMedia = currentProject.media.files.length > 0;
  const canAddMore = currentProject.media.files.length < getMaxFiles();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-ig-text-primary font-instagram">
            {isVideo ? 'Carica Video' : 'Carica Immagini'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {canAddMore && (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive || dragActive 
                  ? 'border-ig-primary bg-ig-primary/5' 
                  : 'border-ig-border hover:border-ig-primary/50 hover:bg-ig-hover'
                }
                ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center space-y-3">
                {isVideo ? (
                  <Video className="h-12 w-12 text-ig-text-tertiary" />
                ) : (
                  <Upload className="h-12 w-12 text-ig-text-tertiary" />
                )}
                
                <div className="space-y-1">
                  <p className="text-ig-text-primary font-instagram font-medium">
                    {isDragActive || dragActive
                      ? `Rilascia ${isVideo ? 'il video' : 'le immagini'} qui`
                      : `Trascina ${isVideo ? 'un video' : 'le immagini'} o fai clic`
                    }
                  </p>
                  <p className="text-xs text-ig-text-secondary font-instagram">
                    {isVideo 
                      ? 'MP4, MOV fino a 100MB'
                      : currentProject.type === 'carousel'
                        ? 'JPG, PNG, WebP - Fino a 10 immagini'
                        : 'JPG, PNG, WebP'
                    }
                  </p>
                </div>
              </div>

              {isUploading && (
                <div className="mt-4">
                  <Progress value={50} className="w-full" />
                  <p className="text-xs text-ig-text-secondary mt-2 font-instagram">
                    Caricamento in corso...
                  </p>
                </div>
              )}
            </div>
          )}

          {fileRejections.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-instagram">
                {fileRejections.map((rejection, index) => (
                  <div key={index} className="text-sm">
                    {rejection.file.name}: {rejection.errors[0]?.message}
                  </div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {hasMedia && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-ig-text-primary font-instagram">
                  File caricati ({currentProject.media.files.length})
                </h4>
                {currentProject.type === 'carousel' && (
                  <Badge variant="secondary" className="font-instagram">
                    {currentProject.media.files.length}/10
                  </Badge>
                )}
              </div>

              <div className="grid gap-3">
                {currentProject.media.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center p-3 bg-muted/50 rounded-lg border border-ig-border"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      {file.type === 'image' ? (
                        <ImageIcon className="h-5 w-5 text-ig-text-secondary" />
                      ) : (
                        <Video className="h-5 w-5 text-ig-text-secondary" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ig-text-primary font-instagram truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-ig-text-secondary font-instagram">
                          {file.width && file.height && `${file.width} × ${file.height}px`}
                          {file.duration && ` • ${Math.round(file.duration)}s`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {file.src && (
                        <div className="w-12 h-12 rounded border border-ig-border overflow-hidden bg-muted">
                          {file.type === 'image' ? (
                            <img
                              src={file.src}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={file.src}
                              className="w-full h-full object-cover"
                              muted
                            />
                          )}
                        </div>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMedia(file.id)}
                        className="text-ig-text-secondary hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}