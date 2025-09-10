import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MediaFile {
  id: string;
  type: 'image' | 'video';
  src: string;
  name: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface Project {
  id: string;
  title: string;
  type: 'post' | 'carousel' | 'reel';
  createdAt: number;
  updatedAt: number;
  media: {
    files: MediaFile[];
    order?: string[];
    cover?: {
      src: string;
      from: 'frame' | 'upload';
      time?: number;
    };
  };
  render: {
    fitMode: 'fit' | 'crop' | 'manual';
    zoom: number;
    pan: { x: number; y: number };
    blurBg: boolean;
    reel: {
      start?: number;
      end?: number;
      muted: boolean;
    };
  };
  caption: {
    text: string;
    clampMode: '2lines' | '125chars';
  };
  profile: {
    username: string;
    avatarSrc?: string;
  };
  settings: {
    theme: 'light' | 'dark';
    language: 'it' | 'en';
  };
}

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
  updateMediaCrop: (fileId: string, updates: Partial<Project['render']>) => void;
  
  // Caption actions
  updateCaption: (text: string) => void;
  updateCaptionClampMode: (mode: '2lines' | '125chars') => void;
  
  // Profile actions
  updateProfile: (updates: Partial<Project['profile']>) => void;
  
  // UI actions
  setActiveTab: (tab: ProjectStore['activeTab']) => void;
  setIsUploading: (isUploading: boolean) => void;
}

const createDefaultProject = (type: Project['type']): Project => ({
  id: `project_${Date.now()}`,
  title: `Nuovo ${type === 'post' ? 'Post' : type === 'carousel' ? 'Carosello' : 'Reel'}`,
  type,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  media: {
    files: [],
    order: [],
  },
  render: {
    fitMode: 'crop',
    zoom: 1,
    pan: { x: 0, y: 0 },
    blurBg: false,
    reel: {
      muted: false,
    },
  },
  caption: {
    text: '',
    clampMode: '2lines',
  },
  profile: {
    username: 'il_tuo_profilo',
    avatarSrc: undefined,
  },
  settings: {
    theme: 'light',
    language: 'it',
  },
});

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      currentProject: null,
      activeTab: 'feed',
      isUploading: false,
      savedProjects: [],

      createProject: (type) => {
        const newProject = createDefaultProject(type);
        set({
          currentProject: newProject,
          activeTab: 'feed',
        });
      },

      updateProject: (updates) => {
        const current = get().currentProject;
        if (!current) return;

        const updatedProject = {
          ...current,
          ...updates,
          updatedAt: Date.now(),
        };

        set({ currentProject: updatedProject });
      },

      saveProject: () => {
        const current = get().currentProject;
        if (!current) return;

        const savedProjects = get().savedProjects;
        const existingIndex = savedProjects.findIndex(p => p.id === current.id);

        if (existingIndex >= 0) {
          savedProjects[existingIndex] = current;
        } else {
          savedProjects.push(current);
        }

        set({ savedProjects: [...savedProjects] });
      },

      loadProject: (projectId) => {
        const project = get().savedProjects.find(p => p.id === projectId);
        if (project) {
          set({ 
            currentProject: { ...project },
            activeTab: 'feed'
          });
        }
      },

      deleteProject: (projectId) => {
        const savedProjects = get().savedProjects.filter(p => p.id !== projectId);
        set({ savedProjects });
        
        if (get().currentProject?.id === projectId) {
          set({ currentProject: null });
        }
      },

      addMedia: async (files) => {
        set({ isUploading: true });
        
        try {
          const current = get().currentProject;
          if (!current) return;

          const mediaFiles: MediaFile[] = [];

          for (const file of files) {
            const id = `media_${Date.now()}_${Math.random()}`;
            const src = URL.createObjectURL(file);
            
            let width: number | undefined;
            let height: number | undefined;
            let duration: number | undefined;

            if (file.type.startsWith('image/')) {
              const img = new Image();
              await new Promise((resolve) => {
                img.onload = resolve;
                img.src = src;
              });
              width = img.naturalWidth;
              height = img.naturalHeight;
            } else if (file.type.startsWith('video/')) {
              const video = document.createElement('video');
              await new Promise((resolve) => {
                video.onloadedmetadata = resolve;
                video.src = src;
              });
              width = video.videoWidth;
              height = video.videoHeight;
              duration = video.duration;
            }

            mediaFiles.push({
              id,
              type: file.type.startsWith('image/') ? 'image' : 'video',
              src,
              name: file.name,
              width,
              height,
              duration,
            });
          }

          const updatedFiles = [...current.media.files, ...mediaFiles];
          const updatedOrder = [...(current.media.order || []), ...mediaFiles.map(f => f.id)];

          get().updateProject({
            media: {
              ...current.media,
              files: updatedFiles,
              order: updatedOrder,
            },
          });
        } finally {
          set({ isUploading: false });
        }
      },

      removeMedia: (fileId) => {
        const current = get().currentProject;
        if (!current) return;

        // Clean up object URL
        const file = current.media.files.find(f => f.id === fileId);
        if (file?.src.startsWith('blob:')) {
          URL.revokeObjectURL(file.src);
        }

        const updatedFiles = current.media.files.filter(f => f.id !== fileId);
        const updatedOrder = (current.media.order || []).filter(id => id !== fileId);

        get().updateProject({
          media: {
            ...current.media,
            files: updatedFiles,
            order: updatedOrder,
          },
        });
      },

      reorderMedia: (order) => {
        const current = get().currentProject;
        if (!current) return;

        get().updateProject({
          media: {
            ...current.media,
            order,
          },
        });
      },

      updateMediaCrop: (fileId, updates) => {
        const current = get().currentProject;
        if (!current) return;

        get().updateProject({
          render: {
            ...current.render,
            ...updates,
          },
        });
      },

      updateCaption: (text) => {
        const current = get().currentProject;
        if (!current) return;

        // Limit to 2200 characters
        const trimmedText = text.slice(0, 2200);

        get().updateProject({
          caption: {
            ...current.caption,
            text: trimmedText,
          },
        });
      },

      updateCaptionClampMode: (mode) => {
        const current = get().currentProject;
        if (!current) return;

        get().updateProject({
          caption: {
            ...current.caption,
            clampMode: mode,
          },
        });
      },

      updateProfile: (updates) => {
        const current = get().currentProject;
        if (!current) return;

        get().updateProject({
          profile: {
            ...current.profile,
            ...updates,
          },
        });
      },

      setActiveTab: (tab) => set({ activeTab: tab }),
      setIsUploading: (isUploading) => set({ isUploading }),
    }),
    {
      name: 'instagram-preview-store',
      partialize: (state) => ({
        savedProjects: state.savedProjects,
      }),
    }
  )
);