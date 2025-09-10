# Componenti React - Visual Gram Lab

Questa documentazione descrive tutti i componenti React dell'applicazione Visual Gram Lab, le loro props, funzionalità e utilizzo.

## 📋 Indice

- [Componenti Principali](#componenti-principali)
- [Componenti UI](#componenti-ui)
- [Componenti Preview](#componenti-preview)
- [Hooks Personalizzati](#hooks-personalizzati)
- [Pattern e Best Practices](#pattern-e-best-practices)

## 🏗️ Componenti Principali

### AppHeader
**File**: `src/components/AppHeader.tsx`

Header principale dell'applicazione con logo, titolo e controlli tema.

```typescript
export function AppHeader() {
  const { theme, setTheme } = useTheme();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-ig-border bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-ig-gradient w-8 h-8 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">IG</span>
          </div>
          <h1 className="text-lg font-semibold font-instagram text-ig-text-primary">
            Instagram Preview
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
```

**Caratteristiche**:
- Logo Instagram-style con gradiente
- Toggle tema chiaro/scuro
- Header sticky con backdrop blur
- Design responsive

### ProjectTypeTabs
**File**: `src/components/ProjectTypeTabs.tsx`

Selettore per il tipo di contenuto Instagram (Post, Carosello, Reel).

```typescript
export function ProjectTypeTabs() {
  const { currentProject, createProject } = useProjectStore();

  const handleTypeChange = (type: string) => {
    createProject(type as 'post' | 'carousel' | 'reel');
  };

  return (
    <Tabs value={currentProject?.type || 'post'} onValueChange={handleTypeChange}>
      <TabsList className="grid w-full grid-cols-3 bg-muted/50">
        <TabsTrigger value="post" className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          Post
        </TabsTrigger>
        <TabsTrigger value="carousel" className="flex items-center gap-2">
          <Images className="h-4 w-4" />
          Carosello
        </TabsTrigger>
        <TabsTrigger value="reel" className="flex items-center gap-2">
          <Video className="h-4 w-4" />
          Reel
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
```

**Props**: Nessuna (utilizza Zustand store)
**Funzionalità**:
- Selezione tipo contenuto
- Icone descrittive per ogni tipo
- Integrazione con store globale
- Styling Instagram-like

### UploaderPanel
**File**: `src/components/UploaderPanel.tsx`

Pannello per il caricamento di immagini e video con drag & drop.

```typescript
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
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carica {isVideo ? 'Video' : 'Immagini'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-8 text-center">
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-ig-text-tertiary" />
          <p>Trascina file o fai clic per caricare</p>
        </div>
        
        {hasMedia && (
          <div className="space-y-3">
            {currentProject.media.files.map((file) => (
              <div key={file.id} className="flex items-center p-3 bg-muted/50 rounded-lg">
                <ImageIcon className="h-5 w-5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-ig-text-secondary">
                    {file.width} × {file.height}px
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeMedia(file.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Caratteristiche**:
- Drag & drop con react-dropzone
- Validazione file per tipo progetto
- Preview file caricati
- Gestione errori upload
- Progress indicator
- Rimozione file individuale

### CaptionPanel
**File**: `src/components/CaptionPanel.tsx`

Editor per le caption Instagram con contatori e formattazione.

```typescript
export function CaptionPanel() {
  const { currentProject, updateCaption, updateCaptionClampMode } = useProjectStore();

  if (!currentProject) return null;

  const { text, clampMode } = currentProject.caption;
  const charCount = text.length;
  const maxChars = 2200;
  
  // Conta hashtag e mention
  const hashtagCount = (text.match(/#\w+/g) || []).length;
  const mentionCount = (text.match(/@\w+/g) || []).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Caption
          <Badge variant="outline">{charCount}/{maxChars}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Scrivi la tua caption qui..."
          value={text}
          onChange={(e) => updateCaption(e.target.value)}
          className="min-h-[120px] resize-none"
          disabled={charCount >= maxChars}
        />
        
        <Progress value={(charCount / maxChars) * 100} />
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Hash className="h-3 w-3" />
              <span>{hashtagCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <AtSign className="h-3 w-3" />
              <span>{mentionCount}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Modalità anteprima nel feed</Label>
          <div className="flex items-center space-x-3">
            <Switch
              checked={clampMode === '2lines'}
              onCheckedChange={(checked) => 
                updateCaptionClampMode(checked ? '2lines' : '125chars')
              }
            />
            <Label>{clampMode === '2lines' ? '2 righe' : '~125 caratteri'}</Label>
          </div>
        </div>

        {text && (
          <div className="p-3 bg-muted/30 rounded-lg">
            <div
              dangerouslySetInnerHTML={{
                __html: text
                  .replace(/\n/g, '<br>')
                  .replace(/#(\w+)/g, '<span class="text-ig-primary font-medium">#$1</span>')
                  .replace(/@(\w+)/g, '<span class="text-ig-primary font-medium">@$1</span>')
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Caratteristiche**:
- Contatore caratteri con progress bar
- Contatori hashtag e mention
- Modalità clamp (2 righe vs 125 caratteri)
- Preview formattazione in tempo reale
- Validazione limite caratteri
- Highlighting hashtag/mention

### PreviewPanel
**File**: `src/components/preview/PreviewPanel.tsx`

Pannello principale per l'anteprima dei contenuti Instagram.

```typescript
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Anteprima Instagram</CardTitle>
          <Button onClick={exportPreview} size="sm">
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
            <div data-preview="detail">
              <DetailPreview />
            </div>
          )}
          
          {activeTab === 'grid' && (
            <div data-preview="grid">
              <GridPreview />
            </div>
          )}
          
          {activeTab === 'reel' && (
            <div data-preview="reel">
              <ReelPreview />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Caratteristiche**:
- Tab per diverse viste (feed, dettaglio, griglia, reel)
- Export PNG ad alta risoluzione
- Integrazione html2canvas
- Layout responsive
- Controlli preview

### ProjectBar
**File**: `src/components/ProjectBar.tsx`

Barra azioni per la gestione dei progetti.

```typescript
export function ProjectBar() {
  const { currentProject, saveProject } = useProjectStore();

  const handleSave = () => {
    if (currentProject) {
      saveProject();
    }
  };

  const duplicateProject = () => {
    if (currentProject) {
      const duplicatedProject = {
        ...currentProject,
        id: `project_${Date.now()}`,
        title: `${currentProject.title} (copia)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      // Implementazione duplicazione
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={!currentProject}>
              <Save className="h-4 w-4" />
              Salva
            </Button>
            
            <Button variant="outline" disabled={!currentProject}>
              <FolderOpen className="h-4 w-4" />
              Carica
            </Button>
            
            <Button onClick={duplicateProject} variant="outline" disabled={!currentProject}>
              <Copy className="h-4 w-4" />
              Duplica
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <a href="/archive">Archivio</a>
            </Button>
            <ShareButton />
          </div>
        </div>

        {currentProject && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-ig-text-secondary">
              <span className="font-medium">{currentProject.title}</span>
              {' • '}
              <span className="capitalize">{currentProject.type}</span>
              {' • '}
              {currentProject.media.files.length} file
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Caratteristiche**:
- Azioni salva/carica/duplica
- Link ad archivio
- Integrazione ShareButton
- Info progetto corrente
- Stati disabled appropriati

## 🎨 Componenti UI

### ShareButton
**File**: `src/components/ShareButton.tsx`

Componente per la condivisone dei progetti.

```typescript
export function ShareButton() {
  const { currentProject } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleShare = async () => {
    if (!currentProject) return;
    
    try {
      const projectId = await saveProject(currentProject);
      const shareUrl = createShareableLink(projectId);
      
      if (navigator.share) {
        await navigator.share({
          title: currentProject.title,
          text: 'Guarda questo progetto Instagram',
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        // Mostra toast di conferma
      }
    } catch (error) {
      console.error('Errore nella condivisione:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share className="h-4 w-4" />
          Condividi
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Condividi Progetto</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Button onClick={handleShare} className="w-full">
            <Share className="h-4 w-4 mr-2" />
            Genera Link Condivisione
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### ReelPlayer
**File**: `src/components/ReelPlayer.tsx`

Player video per i reel con controlli personalizzati.

```typescript
export function ReelPlayer({ src, muted = false, autoPlay = true }: ReelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        muted={muted}
        autoPlay={autoPlay}
        loop
        className="w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <Button
          variant="ghost"
          size="icon"
          className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-8 w-8 text-white" />
          ) : (
            <Play className="h-8 w-8 text-white" />
          )}
        </Button>
      </div>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center space-x-2">
          <span className="text-white text-xs">
            {Math.floor(currentTime)}s
          </span>
          <div className="flex-1 bg-white/30 rounded-full h-1">
            <div 
              className="bg-white rounded-full h-1"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <span className="text-white text-xs">
            {Math.floor(duration)}s
          </span>
        </div>
      </div>
    </div>
  );
}
```

## 📱 Componenti Preview

### FeedPreview
**File**: `src/components/preview/FeedPreview.tsx`

Anteprima del feed Instagram.

```typescript
export function FeedPreview() {
  const { currentProject } = useProjectStore();

  if (!currentProject || currentProject.media.files.length === 0) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
          <p className="text-ig-text-secondary text-sm">Nessun media caricato</p>
        </div>
      </div>
    );
  }

  const mainFile = currentProject.media.files[0];
  const isVideo = mainFile.type === 'video';

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-lg border border-ig-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-3 space-x-3">
        <div className="w-8 h-8 bg-ig-gradient rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {currentProject.profile.username.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-ig-text-primary">
            {currentProject.profile.username}
          </p>
        </div>
        <MoreHorizontal className="h-4 w-4 text-ig-text-secondary" />
      </div>

      {/* Media */}
      <div className="aspect-square bg-black">
        {isVideo ? (
          <ReelPlayer src={mainFile.src} />
        ) : (
          <img
            src={mainFile.src}
            alt={mainFile.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Actions */}
      <div className="p-3 space-y-3">
        <div className="flex items-center space-x-4">
          <Heart className="h-6 w-6 text-ig-text-primary" />
          <MessageCircle className="h-6 w-6 text-ig-text-primary" />
          <Send className="h-6 w-6 text-ig-text-primary" />
          <Bookmark className="h-6 w-6 text-ig-text-primary ml-auto" />
        </div>

        {/* Caption */}
        {currentProject.caption.text && (
          <div className="space-y-1">
            <p className="text-sm text-ig-text-primary">
              <span className="font-semibold">{currentProject.profile.username}</span>
              {' '}
              <span
                dangerouslySetInnerHTML={{
                  __html: currentProject.caption.text
                    .replace(/#(\w+)/g, '<span class="text-ig-primary font-medium">#$1</span>')
                    .replace(/@(\w+)/g, '<span class="text-ig-primary font-medium">@$1</span>')
                }}
              />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### PreviewTabs
**File**: `src/components/preview/PreviewTabs.tsx`

Tab per le diverse viste di anteprima.

```typescript
export function PreviewTabs() {
  const { activeTab, setActiveTab } = useProjectStore();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="feed" className="flex items-center gap-2">
          <Grid3X3 className="h-4 w-4" />
          Feed
        </TabsTrigger>
        <TabsTrigger value="detail" className="flex items-center gap-2">
          <Maximize className="h-4 w-4" />
          Dettaglio
        </TabsTrigger>
        <TabsTrigger value="grid" className="flex items-center gap-2">
          <Grid className="h-4 w-4" />
          Griglia
        </TabsTrigger>
        <TabsTrigger value="reel" className="flex items-center gap-2">
          <Video className="h-4 w-4" />
          Reel
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
```

## 🎣 Hooks Personalizzati

### useProjectStore
**File**: `src/store/useProjectStore.ts`

Store Zustand per la gestione dello stato globale.

```typescript
interface ProjectStore {
  // Current project
  currentProject: Project | null;
  
  // UI state
  activeTab: 'feed' | 'detail' | 'grid' | 'reel';
  isUploading: boolean;
  
  // Saved projects
  savedProjects: Project[];
  
  // Actions
  createProject: (type: Project['type']) => void;
  updateProject: (updates: Partial<Project>) => void;
  saveProject: () => void;
  loadProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  
  // Media actions
  addMedia: (files: File[]) => Promise<void>;
  removeMedia: (fileId: string) => void;
  reorderMedia: (order: string[]) => void;
  
  // Caption actions
  updateCaption: (text: string) => void;
  updateCaptionClampMode: (mode: '2lines' | '125chars') => void;
  
  // Profile actions
  updateProfile: (updates: Partial<Project['profile']>) => void;
  
  // UI actions
  setActiveTab: (tab: ProjectStore['activeTab']) => void;
  setIsUploading: (isUploading: boolean) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      // Implementation...
    }),
    {
      name: 'instagram-preview-store',
      partialize: (state) => ({
        savedProjects: state.savedProjects,
      }),
    }
  )
);
```

### useTheme
**File**: `src/components/ThemeProvider.tsx`

Hook per la gestione del tema.

```typescript
export function ThemeProvider({ children, defaultTheme = "system", storageKey = "instagram-preview-theme" }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
      return;
    }
    
    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
```

## 🎯 Pattern e Best Practices

### 1. Gestione Stato
- **Zustand** per stato globale
- **useState** per stato locale componente
- **Persist** per salvataggio automatico
- **Partialize** per selezionare cosa persistere

### 2. Gestione File
- **Blob URLs** per preview locale
- **Supabase Storage** per persistenza
- **File validation** per tipo e dimensione
- **Cleanup** automatico blob URLs

### 3. Performance
- **useCallback** per funzioni passate come props
- **useMemo** per calcoli costosi
- **Lazy loading** per componenti pesanti
- **Debounce** per input frequenti

### 4. Accessibilità
- **ARIA labels** per controlli
- **Keyboard navigation** completa
- **Screen reader** support
- **Focus management** appropriato

### 5. Error Handling
- **Try-catch** per operazioni async
- **Error boundaries** per errori React
- **Toast notifications** per feedback utente
- **Fallback UI** per stati di errore

### 6. Styling
- **Tailwind CSS** per utility classes
- **CSS Variables** per temi
- **Responsive design** mobile-first
- **Instagram-like** design system

---

Questa documentazione copre tutti i componenti principali dell'applicazione. Per implementazioni specifiche o esempi aggiuntivi, consulta il codice sorgente o apri una issue su GitHub.
