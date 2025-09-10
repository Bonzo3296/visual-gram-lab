# API Documentation - Visual Gram Lab

Questa documentazione descrive tutte le API e i servizi utilizzati nell'applicazione Visual Gram Lab, con particolare focus sull'integrazione Supabase.

## 📋 Indice

- [Configurazione Supabase](#configurazione-supabase)
- [Database Schema](#database-schema)
- [API Progetti](#api-progetti)
- [API Commenti](#api-commenti)
- [API Calendario](#api-calendario)
- [Storage API](#storage-api)
- [Autenticazione](#autenticazione)
- [Error Handling](#error-handling)
- [Esempi di Utilizzo](#esempi-di-utilizzo)

## 🔧 Configurazione Supabase

### Client Setup
```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jdejifylczviylgdolfk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

### Variabili d'Ambiente
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🗄️ Database Schema

### Tabella `projects`
```sql
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('post','carousel','reel')),
  title text,
  caption text,
  media jsonb NOT NULL DEFAULT '[]'::jsonb,
  cover jsonb,
  render jsonb,
  profile jsonb,
  settings jsonb,
  approved boolean NOT NULL DEFAULT false,
  feedback text,
  scheduled_date date,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### Tabella `comments`
```sql
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  author_role text NOT NULL CHECK (author_role IN ('client', 'agency')),
  author_name text,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### Tabella `calendar_items`
```sql
CREATE TABLE public.calendar_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  scheduled_date date NOT NULL,
  scheduled_time time,
  platform text DEFAULT 'instagram',
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id)
);
```

## 📁 API Progetti

### Salvare un Progetto
```typescript
export async function saveProject(project: Project): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  
  const projectData = {
    type: project.type,
    title: project.title,
    caption: project.caption.text,
    media: project.media,
    cover: project.media.cover,
    render: project.render,
    profile: project.profile,
    settings: project.settings,
    owner: user?.id || null
  };

  if (project.id && project.id.startsWith('project_')) {
    // Crea nuovo progetto
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  } else {
    // Aggiorna progetto esistente
    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', project.id)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }
}
```

### Recuperare Progetto per ID
```typescript
export async function getProjectById(id: string): Promise<DatabaseProject | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Progetto non trovato
    }
    throw error;
  }

  return data as DatabaseProject;
}
```

### Recuperare Tutti i Progetti
```typescript
export async function getAllProjects(): Promise<DatabaseProject[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data as DatabaseProject[];
}
```

### Aggiornare Approvazione Progetto
```typescript
export async function updateProjectApproval(projectId: string, approved: boolean): Promise<void> {
  const updates: any = { 
    approved, 
    approved_at: approved ? new Date().toISOString() : null 
  };

  const { error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId);

  if (error) throw error;
}
```

### Aggiornare Feedback Progetto
```typescript
export async function updateProjectFeedback(projectId: string, feedback: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ feedback })
    .eq('id', projectId);

  if (error) throw error;
}
```

## 💬 API Commenti

### Aggiungere Commento
```typescript
export async function addComment(
  projectId: string, 
  body: string, 
  authorRole: 'client' | 'agency', 
  authorName?: string
): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .insert([{
      project_id: projectId,
      author_role: authorRole,
      author_name: authorName,
      body
    }]);

  if (error) throw error;
}
```

### Recuperare Commenti
```typescript
export async function getComments(projectId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Comment[];
}
```

## 📅 API Calendario

### Programmare Progetto
```typescript
export async function scheduleProject(
  projectId: string, 
  scheduledDate: string, 
  scheduledTime?: string, 
  note?: string
): Promise<void> {
  const { error } = await supabase
    .from('calendar_items')
    .upsert([{
      project_id: projectId,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      note,
      platform: 'instagram'
    }], { onConflict: 'project_id' });

  if (error) throw error;
}
```

### Recuperare Elementi Calendario
```typescript
export async function getCalendarItems(startDate: string, endDate: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('calendar_items')
    .select(`
      *,
      projects!inner (
        id,
        title,
        type,
        approved,
        media,
        cover
      )
    `)
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate);

  if (error) throw error;
  return data || [];
}
```

## 📁 Storage API

### Upload File Media
```typescript
export async function uploadMediaFile(file: File, projectId: string, fileId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${fileId}.${fileExt}`;
  const filePath = `projects/${projectId}/media/${fileName}`;

  const { data, error } = await supabase.storage
    .from('project-media')
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('project-media')
    .getPublicUrl(filePath);

  return publicUrl;
}
```

### Eliminare File
```typescript
export async function deleteMediaFile(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from('project-media')
    .remove([filePath]);

  if (error) throw error;
}
```

### Lista File in Progetto
```typescript
export async function listProjectFiles(projectId: string): Promise<any[]> {
  const { data, error } = await supabase.storage
    .from('project-media')
    .list(`projects/${projectId}/media`);

  if (error) throw error;
  return data || [];
}
```

## 🔐 Autenticazione

### Login Utente
```typescript
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}
```

### Registrazione Utente
```typescript
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}
```

### Logout Utente
```typescript
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
```

### Recuperare Utente Corrente
```typescript
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}
```

### Ascoltare Cambiamenti Autenticazione
```typescript
export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
}
```

## ⚠️ Error Handling

### Gestione Errori Standard
```typescript
try {
  const result = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();
    
  if (result.error) {
    throw new Error(`Database error: ${result.error.message}`);
  }
  
  return result.data;
} catch (error) {
  console.error('API Error:', error);
  throw error;
}
```

### Codici Errore Comuni
- `PGRST116`: Riga non trovata
- `23505`: Violazione constraint unico
- `23503`: Violazione foreign key
- `42501`: Permessi insufficienti (RLS)

### Retry Logic
```typescript
export async function withRetry<T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

## 📝 Esempi di Utilizzo

### Creare e Salvare un Progetto Completo
```typescript
import { useProjectStore } from '@/store/useProjectStore';
import { saveProject, uploadMediaFile } from '@/services/projectService';

const MyComponent = () => {
  const { currentProject, createProject } = useProjectStore();
  
  const handleSaveProject = async () => {
    if (!currentProject) return;
    
    try {
      // Upload media files se necessario
      const updatedMediaFiles = [];
      for (const file of currentProject.media.files) {
        if (file.src.startsWith('blob:')) {
          // Converti blob URL in file e upload
          const response = await fetch(file.src);
          const blob = await response.blob();
          const fileObj = new File([blob], file.name, { type: file.type });
          
          const publicUrl = await uploadMediaFile(fileObj, 'temp-id', file.id);
          updatedMediaFiles.push({ ...file, src: publicUrl });
        } else {
          updatedMediaFiles.push(file);
        }
      }
      
      // Salva progetto con media aggiornati
      const projectWithUpdatedMedia = {
        ...currentProject,
        media: { ...currentProject.media, files: updatedMediaFiles }
      };
      
      const projectId = await saveProject(projectWithUpdatedMedia);
      console.log('Progetto salvato con ID:', projectId);
      
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
    }
  };
  
  return (
    <button onClick={handleSaveProject}>
      Salva Progetto
    </button>
  );
};
```

### Gestire Commenti in Tempo Reale
```typescript
import { useEffect, useState } from 'react';
import { getComments, addComment } from '@/services/projectService';

const CommentsSection = ({ projectId }: { projectId: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  
  useEffect(() => {
    loadComments();
    
    // Sottoscrivi a cambiamenti real-time
    const subscription = supabase
      .channel('comments')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'comments',
          filter: `project_id=eq.${projectId}`
        }, 
        (payload) => {
          setComments(prev => [...prev, payload.new as Comment]);
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [projectId]);
  
  const loadComments = async () => {
    try {
      const commentsData = await getComments(projectId);
      setComments(commentsData);
    } catch (error) {
      console.error('Errore nel caricamento commenti:', error);
    }
  };
  
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await addComment(projectId, newComment, 'client', 'Utente');
      setNewComment('');
    } catch (error) {
      console.error('Errore nell\'aggiunta commento:', error);
    }
  };
  
  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id}>
          <strong>{comment.author_name || comment.author_role}</strong>
          <p>{comment.body}</p>
          <small>{new Date(comment.created_at).toLocaleString()}</small>
        </div>
      ))}
      
      <textarea 
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Aggiungi un commento..."
      />
      <button onClick={handleAddComment}>Invia</button>
    </div>
  );
};
```

### Gestire Calendario e Programmazione
```typescript
import { scheduleProject, getCalendarItems } from '@/services/projectService';

const CalendarManager = () => {
  const [calendarItems, setCalendarItems] = useState([]);
  
  const scheduleProjectForDate = async (projectId: string, date: string, time?: string) => {
    try {
      await scheduleProject(projectId, date, time, 'Programmato da app');
      console.log('Progetto programmato con successo');
    } catch (error) {
      console.error('Errore nella programmazione:', error);
    }
  };
  
  const loadCalendarWeek = async () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);
    
    try {
      const items = await getCalendarItems(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setCalendarItems(items);
    } catch (error) {
      console.error('Errore nel caricamento calendario:', error);
    }
  };
  
  return (
    <div>
      <button onClick={loadCalendarWeek}>Carica Settimana</button>
      {calendarItems.map(item => (
        <div key={item.id}>
          <h3>{item.projects.title}</h3>
          <p>Data: {item.scheduled_date}</p>
          {item.scheduled_time && <p>Ora: {item.scheduled_time}</p>}
        </div>
      ))}
    </div>
  );
};
```

## 🔒 Sicurezza e Policy

### Row Level Security (RLS)
Tutte le tabelle utilizzano RLS per garantire la sicurezza:

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

### Validazione Input
```typescript
import { z } from 'zod';

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

export function validateProject(project: unknown) {
  return ProjectSchema.parse(project);
}
```

---

Questa documentazione copre tutte le API principali dell'applicazione Visual Gram Lab. Per domande specifiche o esempi aggiuntivi, consulta il codice sorgente o apri una issue su GitHub.
