-- Add new columns for approval, feedback, and scheduling
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS feedback text,
ADD COLUMN IF NOT EXISTS scheduled_date date,
ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- Create comments table for client feedback
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  author_role text NOT NULL CHECK (author_role IN ('client', 'agency')),
  author_name text,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Allow public reading of comments (for shared links)
CREATE POLICY "Comments are publicly readable" 
ON public.comments 
FOR SELECT 
USING (true);

-- Allow anyone to insert comments (for client feedback via shared links)
CREATE POLICY "Anyone can add comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (true);

-- Create calendar_items table for scheduling
CREATE TABLE IF NOT EXISTS public.calendar_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  scheduled_date date NOT NULL,
  scheduled_time time,
  platform text DEFAULT 'instagram',
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id)
);

-- Enable RLS on calendar_items
ALTER TABLE public.calendar_items ENABLE ROW LEVEL SECURITY;

-- Allow public reading of calendar items
CREATE POLICY "Calendar items are publicly readable" 
ON public.calendar_items 
FOR SELECT 
USING (true);

-- Allow authenticated users to manage calendar items
CREATE POLICY "Users can manage calendar items" 
ON public.calendar_items 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);