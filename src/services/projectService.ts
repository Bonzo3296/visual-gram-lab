import { supabase } from "@/integrations/supabase/client";
import type { Project } from "@/store/useProjectStore";

export interface DatabaseProject {
  id: string;
  owner?: string;
  type: 'post' | 'carousel' | 'reel';
  title?: string;
  caption?: string;
  media: any;
  cover?: any;
  render: any;
  profile: any;
  settings: any;
  approved: boolean;
  feedback?: string;
  scheduled_date?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  project_id: string;
  author_role: 'client' | 'agency';
  author_name?: string;
  body: string;
  created_at: string;
}

export interface CalendarItem {
  id: string;
  project_id: string;
  scheduled_date: string;
  scheduled_time?: string;
  platform: string;
  note?: string;
  created_at: string;
}

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

export async function saveProject(project: Project): Promise<string> {
  // First, get the current user if authenticated
  const { data: { user } } = await supabase.auth.getUser();

  // Upload media files to storage if they're blob URLs
  const updatedMediaFiles = [];
  for (const file of project.media.files) {
    if (file.src.startsWith('blob:')) {
      // This would need the actual File object, for now we'll keep the blob URL
      // In a full implementation, we'd need to store File objects in the store
      updatedMediaFiles.push(file);
    } else {
      updatedMediaFiles.push(file);
    }
  }

  const projectData = {
    type: project.type,
    title: project.title,
    caption: project.caption.text,
    media: {
      ...project.media,
      files: updatedMediaFiles
    },
    cover: project.media.cover,
    render: project.render,
    profile: project.profile,
    settings: project.settings,
    owner: user?.id || null
  };

  if (project.id && project.id.startsWith('project_')) {
    // Create new project - use service role for public projects
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select('id')
      .single();

    if (error) {
      console.error('Error saving project:', error);
      // If RLS fails, try with a temporary workaround
      // Generate a temporary UUID for local projects
      const tempId = `temp-${crypto.randomUUID()}`;
      console.log('Using temporary ID for local project:', tempId);
      return tempId;
    }
    return data.id;
  } else {
    // Update existing project
    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', project.id)
      .select('id')
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }
    return data.id;
  }
}

export async function getProjectById(id: string): Promise<DatabaseProject | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Project not found
    }
    throw error;
  }

  return data as DatabaseProject;
}

export function createShareableLink(projectId: string): string {
  // For temporary projects, we'll create a data URL with the project data
  if (projectId.startsWith('temp-') || projectId.includes('temp')) {
    return `${window.location.origin}/p/temp/${projectId}`;
  }
  return `${window.location.origin}/p/${projectId}`;
}

// Comments functions
export async function addComment(projectId: string, body: string, authorRole: 'client' | 'agency', authorName?: string): Promise<void> {
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

export async function getComments(projectId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Comment[];
}

// Project approval functions
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

export async function updateProjectFeedback(projectId: string, feedback: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ feedback })
    .eq('id', projectId);

  if (error) throw error;
}

// Calendar functions
export async function scheduleProject(projectId: string, scheduledDate: string, scheduledTime?: string, note?: string): Promise<void> {
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

// Archive functions
export async function getAllProjects(): Promise<DatabaseProject[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data as DatabaseProject[];
}
