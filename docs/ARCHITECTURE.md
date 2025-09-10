# Architettura dell'Applicazione - Visual Gram Lab

Questa documentazione descrive l'architettura completa dell'applicazione Visual Gram Lab, i pattern utilizzati e le decisioni di design.

## 📋 Indice

- [Panoramica Architettura](#panoramica-architettura)
- [Stack Tecnologico](#stack-tecnologico)
- [Architettura Frontend](#architettura-frontend)
- [Architettura Backend](#architettura-backend)
- [Pattern di Design](#pattern-di-design)
- [Gestione Stato](#gestione-stato)
- [Flusso Dati](#flusso-dati)
- [Sicurezza](#sicurezza)
- [Performance](#performance)
- [Scalabilità](#scalabilità)

## 🏗️ Panoramica Architettura

Visual Gram Lab segue un'architettura **Single Page Application (SPA)** moderna con separazione netta tra frontend e backend.

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                         │
├─────────────────────────────────────────────────────────────┤
│  React App (Vite + TypeScript)                             │
│  ├── Components (UI Layer)                                 │
│  ├── Hooks (Business Logic)                                │
│  ├── Store (State Management)                              │
│  └── Services (API Layer)                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              │
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                         │
├─────────────────────────────────────────────────────────────┤
│  ├── PostgreSQL Database                                   │
│  ├── Authentication Service                                │
│  ├── Storage Service                                       │
│  ├── Real-time Subscriptions                              │
│  └── Edge Functions (Future)                              │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Stack Tecnologico

### Frontend Stack
```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND STACK                           │
├─────────────────────────────────────────────────────────────┤
│  React 18.3.1          │ UI Framework                      │
│  TypeScript 5.8.3      │ Type Safety                       │
│  Vite 5.4.19           │ Build Tool & Dev Server           │
│  Tailwind CSS 3.4.17   │ Styling Framework                 │
│  shadcn/ui             │ Component Library                  │
│  Zustand 5.0.8         │ State Management                  │
│  React Router 6.30.1   │ Client-side Routing               │
│  React Query 5.83.0    │ Server State Management           │
│  React Dropzone 14.3.8 │ File Upload                       │
│  html2canvas 1.4.1     │ Canvas Export                     │
└─────────────────────────────────────────────────────────────┘
```

### Backend Stack
```
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND STACK                            │
├─────────────────────────────────────────────────────────────┤
│  Supabase              │ Backend-as-a-Service               │
│  ├── PostgreSQL 13     │ Database                          │
│  ├── PostgREST         │ Auto-generated REST API           │
│  ├── GoTrue            │ Authentication                     │
│  ├── Realtime          │ WebSocket Subscriptions           │
│  └── Storage           │ File Storage                       │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Architettura Frontend

### Struttura delle Cartelle
```
src/
├── components/           # Componenti UI riutilizzabili
│   ├── ui/              # Componenti base (shadcn/ui)
│   ├── preview/         # Componenti specifici preview
│   ├── AppHeader.tsx    # Header applicazione
│   ├── CaptionPanel.tsx # Editor caption
│   ├── ProjectBar.tsx   # Barra azioni progetto
│   ├── ProjectTypeTabs.tsx # Selezione tipo contenuto
│   ├── ShareButton.tsx  # Condivisione progetti
│   ├── ThemeProvider.tsx # Provider tema
│   └── UploaderPanel.tsx # Upload media
├── hooks/               # Custom React hooks
│   ├── use-mobile.tsx   # Hook per rilevamento mobile
│   └── use-toast.ts     # Hook per notifiche
├── integrations/        # Integrazioni esterne
│   └── supabase/        # Configurazione Supabase
│       ├── client.ts    # Client Supabase
│       └── types.ts     # Tipi TypeScript generati
├── lib/                 # Utilities e helpers
│   └── utils.ts         # Funzioni utility
├── pages/               # Pagine applicazione
│   ├── Index.tsx        # Homepage principale
│   ├── Archive.tsx      # Archivio progetti
│   ├── Calendar.tsx     # Calendario pubblicazioni
│   ├── PublicProject.tsx # Vista progetto pubblico
│   └── NotFound.tsx     # Pagina 404
├── services/            # Servizi API
│   └── projectService.ts # API progetti
├── store/               # State management
│   └── useProjectStore.ts # Store Zustand
├── App.tsx              # Componente root
├── main.tsx             # Entry point
└── index.css            # Stili globali
```

### Architettura Componenti

#### 1. Componenti Presentazionali
```typescript
// Componenti che ricevono props e renderizzano UI
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', size = 'md', children, onClick }: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

#### 2. Componenti Container
```typescript
// Componenti che gestiscono logica e stato
export function ProjectManager() {
  const { currentProject, createProject, saveProject } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await saveProject();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <ProjectForm project={currentProject} onSave={handleSave} />
      <ProjectPreview project={currentProject} />
    </div>
  );
}
```

#### 3. Componenti Compositi
```typescript
// Componenti che combinano altri componenti
export function PreviewPanel() {
  return (
    <Card>
      <CardHeader>
        <PreviewTabs />
      </CardHeader>
      <CardContent>
        <PreviewContent />
        <PreviewControls />
      </CardContent>
    </Card>
  );
}
```

### Pattern di Comunicazione

#### 1. Props Drilling (Limitato)
```typescript
// Solo per componenti strettamente correlati
<ParentComponent>
  <ChildComponent data={data} onUpdate={handleUpdate} />
</ParentComponent>
```

#### 2. Context API (Per temi e configurazioni globali)
```typescript
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

#### 3. Zustand Store (Per stato applicazione)
```typescript
// Stato globale condiviso tra componenti
export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      currentProject: null,
      createProject: (type) => {
        const newProject = createDefaultProject(type);
        set({ currentProject: newProject });
      },
      // ... altre azioni
    }),
    { name: 'instagram-preview-store' }
  )
);
```

## 🗄️ Architettura Backend

### Database Schema
```sql
-- Struttura principale
projects (id, owner, type, title, caption, media, cover, render, profile, settings, approved, feedback, scheduled_date, created_at, updated_at)
    │
    ├── comments (id, project_id, author_role, author_name, body, created_at)
    │
    └── calendar_items (id, project_id, scheduled_date, scheduled_time, platform, note, created_at)
```

### API Design
```typescript
// Pattern RESTful con Supabase
interface ProjectAPI {
  // CRUD Operations
  create(project: ProjectInput): Promise<Project>;
  read(id: string): Promise<Project | null>;
  update(id: string, updates: Partial<ProjectInput>): Promise<Project>;
  delete(id: string): Promise<void>;
  
  // Business Operations
  approve(id: string): Promise<void>;
  schedule(id: string, date: string): Promise<void>;
  addComment(id: string, comment: CommentInput): Promise<Comment>;
  
  // Query Operations
  listByUser(userId: string): Promise<Project[]>;
  listByDateRange(start: string, end: string): Promise<Project[]>;
}
```

### Row Level Security (RLS)
```sql
-- Policy per progetti
CREATE POLICY "Users can manage own projects" ON public.projects
FOR ALL TO authenticated
USING (auth.uid() = owner)
WITH CHECK (auth.uid() = owner);

-- Policy per commenti (pubblici)
CREATE POLICY "Comments are publicly readable" ON public.comments
FOR SELECT USING (true);

-- Policy per storage
CREATE POLICY "Anyone can view project media" ON storage.objects
FOR SELECT USING (bucket_id = 'project-media');
```

## 🎯 Pattern di Design

### 1. Repository Pattern
```typescript
// Astrazione per accesso ai dati
interface ProjectRepository {
  save(project: Project): Promise<string>;
  findById(id: string): Promise<Project | null>;
  findByUser(userId: string): Promise<Project[]>;
  delete(id: string): Promise<void>;
}

class SupabaseProjectRepository implements ProjectRepository {
  constructor(private supabase: SupabaseClient) {}
  
  async save(project: Project): Promise<string> {
    const { data, error } = await this.supabase
      .from('projects')
      .insert([project])
      .select('id')
      .single();
      
    if (error) throw error;
    return data.id;
  }
  
  // ... altre implementazioni
}
```

### 2. Service Layer Pattern
```typescript
// Logica di business separata dalla UI
export class ProjectService {
  constructor(private repository: ProjectRepository) {}
  
  async createProject(type: ProjectType, userId: string): Promise<Project> {
    const project = this.createDefaultProject(type, userId);
    const id = await this.repository.save(project);
    return { ...project, id };
  }
  
  async approveProject(id: string): Promise<void> {
    const project = await this.repository.findById(id);
    if (!project) throw new Error('Project not found');
    
    // Logica di approvazione
    await this.repository.update(id, { 
      approved: true, 
      approved_at: new Date().toISOString() 
    });
  }
}
```

### 3. Observer Pattern (Zustand)
```typescript
// Notifiche automatiche sui cambiamenti di stato
export const useProjectStore = create<ProjectStore>()(
  (set, get) => ({
    currentProject: null,
    observers: new Set(),
    
    subscribe: (callback) => {
      get().observers.add(callback);
      return () => get().observers.delete(callback);
    },
    
    notifyObservers: () => {
      get().observers.forEach(callback => callback(get()));
    },
    
    updateProject: (updates) => {
      set(state => ({
        currentProject: { ...state.currentProject, ...updates }
      }));
      get().notifyObservers();
    }
  })
);
```

### 4. Factory Pattern
```typescript
// Creazione oggetti complessi
export class ProjectFactory {
  static createPostProject(userId: string): Project {
    return {
      id: generateId(),
      type: 'post',
      title: 'Nuovo Post',
      media: { files: [], order: [] },
      render: { fitMode: 'crop', zoom: 1, pan: { x: 0, y: 0 } },
      caption: { text: '', clampMode: '2lines' },
      profile: { username: 'user' },
      settings: { theme: 'light', language: 'it' },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }
  
  static createCarouselProject(userId: string): Project {
    return {
      ...this.createPostProject(userId),
      type: 'carousel',
      title: 'Nuovo Carosello'
    };
  }
}
```

## 🔄 Gestione Stato

### Architettura Stato Globale
```typescript
interface AppState {
  // UI State
  theme: 'light' | 'dark';
  activeTab: string;
  isLoading: boolean;
  
  // Business State
  currentProject: Project | null;
  savedProjects: Project[];
  
  // User State
  user: User | null;
  isAuthenticated: boolean;
}

// Separazione per dominio
export const useUIStore = create<UIState>()(/* ... */);
export const useProjectStore = create<ProjectState>()(/* ... */);
export const useAuthStore = create<AuthState>()(/* ... */);
```

### Pattern di Aggiornamento Stato
```typescript
// Immutable Updates
const updateProject = (updates: Partial<Project>) => {
  set(state => ({
    currentProject: state.currentProject 
      ? { ...state.currentProject, ...updates, updatedAt: Date.now() }
      : null
  }));
};

// Optimistic Updates
const saveProject = async () => {
  const current = get().currentProject;
  if (!current) return;
  
  // Update ottimistico
  set(state => ({ 
    currentProject: { ...current, isSaving: true } 
  }));
  
  try {
    const savedId = await projectService.save(current);
    set(state => ({ 
      currentProject: { ...current, id: savedId, isSaving: false } 
    }));
  } catch (error) {
    // Rollback in caso di errore
    set(state => ({ 
      currentProject: { ...current, isSaving: false, error } 
    }));
  }
};
```

## 📊 Flusso Dati

### 1. Flusso di Creazione Progetto
```
User Action → Component → Store → Service → API → Database
     │           │         │        │       │        │
     │           │         │        │       │        │
     ▼           ▼         ▼        ▼       ▼        ▼
[Click] → [createProject] → [Zustand] → [Service] → [Supabase] → [PostgreSQL]
     │           │         │        │       │        │
     │           │         │        │       │        │
     ▼           ▼         ▼        ▼       ▼        ▼
[UI Update] ← [Component] ← [Store] ← [Response] ← [API] ← [Database]
```

### 2. Flusso di Upload Media
```
File Drop → Dropzone → Store → Service → Storage → Database
    │          │        │        │         │         │
    │          │        │        │         │         │
    ▼          ▼        ▼        ▼         ▼         ▼
[File] → [onDrop] → [addMedia] → [upload] → [Supabase] → [Metadata]
    │          │        │        │         │         │
    │          │        │        │         │         │
    ▼          ▼        ▼        ▼         ▼         ▼
[Preview] ← [UI] ← [Store] ← [URL] ← [Storage] ← [Response]
```

### 3. Flusso di Condivisione
```
Share Click → Component → Service → API → Link Generation
     │           │         │        │         │
     │           │         │        │         │
     ▼           ▼         ▼        ▼         ▼
[Button] → [handleShare] → [save] → [Supabase] → [Public URL]
     │           │         │        │         │
     │           │         │        │         │
     ▼           ▼         ▼        ▼         ▼
[Clipboard] ← [Copy] ← [Response] ← [API] ← [Generated]
```

## 🔒 Sicurezza

### 1. Autenticazione
```typescript
// JWT Token Management
export class AuthService {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Token automaticamente gestito da Supabase
    return data;
  }
  
  async signOut() {
    await supabase.auth.signOut();
    // Cleanup stato locale
    useAuthStore.getState().clearUser();
  }
}
```

### 2. Autorizzazione
```sql
-- Row Level Security
CREATE POLICY "Users can only access own projects" ON projects
FOR ALL TO authenticated
USING (auth.uid() = owner);

-- Storage Security
CREATE POLICY "Users can upload to own folders" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'project-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Validazione Input
```typescript
// Schema validation con Zod
const ProjectSchema = z.object({
  type: z.enum(['post', 'carousel', 'reel']),
  title: z.string().max(100).optional(),
  caption: z.string().max(2200).optional(),
  media: z.object({
    files: z.array(z.object({
      id: z.string(),
      type: z.enum(['image', 'video']),
      src: z.string().url(),
      name: z.string(),
    })),
  }),
});

export function validateProject(project: unknown): Project {
  return ProjectSchema.parse(project);
}
```

## ⚡ Performance

### 1. Code Splitting
```typescript
// Lazy loading per componenti pesanti
const ArchivePage = lazy(() => import('./pages/Archive'));
const CalendarPage = lazy(() => import('./pages/Calendar'));

// Con Suspense
<Suspense fallback={<LoadingSpinner />}>
  <ArchivePage />
</Suspense>
```

### 2. Memoization
```typescript
// Memo per componenti costosi
const ExpensiveComponent = memo(({ data }: { data: ComplexData }) => {
  const processedData = useMemo(() => {
    return expensiveProcessing(data);
  }, [data]);
  
  return <div>{processedData}</div>;
});

// Callback memoization
const handleClick = useCallback(() => {
  // Logica click
}, [dependencies]);
```

### 3. Virtual Scrolling (per liste lunghe)
```typescript
// Per l'archivio progetti
import { FixedSizeList as List } from 'react-window';

const ProjectList = ({ projects }: { projects: Project[] }) => (
  <List
    height={600}
    itemCount={projects.length}
    itemSize={120}
    itemData={projects}
  >
    {({ index, style, data }) => (
      <div style={style}>
        <ProjectCard project={data[index]} />
      </div>
    )}
  </List>
);
```

### 4. Image Optimization
```typescript
// Lazy loading immagini
const LazyImage = ({ src, alt }: { src: string; alt: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={imgRef}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          style={{ opacity: isLoaded ? 1 : 0 }}
        />
      )}
    </div>
  );
};
```

## 📈 Scalabilità

### 1. Micro-frontend Ready
```typescript
// Struttura modulare per future estensioni
interface ModuleConfig {
  name: string;
  component: React.ComponentType;
  routes: RouteConfig[];
  store?: StoreConfig;
}

const modules: ModuleConfig[] = [
  {
    name: 'projects',
    component: ProjectModule,
    routes: [
      { path: '/projects', component: ProjectList },
      { path: '/projects/:id', component: ProjectDetail },
    ],
  },
  {
    name: 'analytics',
    component: AnalyticsModule,
    routes: [
      { path: '/analytics', component: AnalyticsDashboard },
    ],
  },
];
```

### 2. API Versioning
```typescript
// Supporto per versioni API multiple
interface APIConfig {
  version: string;
  baseURL: string;
  endpoints: Record<string, string>;
}

const apiConfigs: Record<string, APIConfig> = {
  v1: {
    version: '1.0',
    baseURL: '/api/v1',
    endpoints: {
      projects: '/projects',
      comments: '/comments',
    },
  },
  v2: {
    version: '2.0',
    baseURL: '/api/v2',
    endpoints: {
      projects: '/projects',
      comments: '/comments',
      analytics: '/analytics',
    },
  },
};
```

### 3. Database Sharding (Future)
```sql
-- Preparazione per sharding orizzontale
CREATE TABLE projects_shard_1 (LIKE projects INCLUDING ALL);
CREATE TABLE projects_shard_2 (LIKE projects INCLUDING ALL);

-- Funzione di routing
CREATE OR REPLACE FUNCTION get_project_shard(project_id uuid)
RETURNS text AS $$
BEGIN
  RETURN 'projects_shard_' || (hashtext(project_id::text) % 2 + 1);
END;
$$ LANGUAGE plpgsql;
```

### 4. Caching Strategy
```typescript
// Multi-level caching
interface CacheConfig {
  memory: {
    ttl: number;
    maxSize: number;
  };
  localStorage: {
    ttl: number;
    key: string;
  };
  serviceWorker: {
    enabled: boolean;
    strategies: CacheStrategy[];
  };
}

const cacheConfig: CacheConfig = {
  memory: { ttl: 5 * 60 * 1000, maxSize: 100 },
  localStorage: { ttl: 24 * 60 * 60 * 1000, key: 'vgl-cache' },
  serviceWorker: {
    enabled: true,
    strategies: ['cache-first', 'network-first', 'stale-while-revalidate'],
  },
};
```

---

Questa documentazione architetturale fornisce una visione completa del design e delle decisioni tecniche di Visual Gram Lab. Per implementazioni specifiche o domande dettagliate, consulta il codice sorgente o apri una issue su GitHub.
