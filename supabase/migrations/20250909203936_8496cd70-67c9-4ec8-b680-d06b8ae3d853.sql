-- Create projects table for shareable Instagram previews
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner uuid references auth.users(id) on delete set null,
  type text not null check (type in ('post','carousel','reel')),
  title text,
  caption text,
  media jsonb not null default '[]'::jsonb,
  cover jsonb,
  render jsonb,
  profile jsonb,
  settings jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.projects enable row level security;

-- Policy: Users can insert/update their own projects
create policy "Users can manage own projects" on public.projects
for all to authenticated
using (auth.uid() = owner)
with check (auth.uid() = owner);

-- Policy: Everyone can read projects (for public sharing)
create policy "Projects are publicly readable" on public.projects
for select using (true);

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger projects_update_updated_at
before update on public.projects
for each row execute function public.update_updated_at_column();

-- Create storage bucket for project media
insert into storage.buckets (id, name, public) values ('project-media', 'project-media', true);

-- Storage policies for project media
create policy "Anyone can view project media" on storage.objects
for select using (bucket_id = 'project-media');

create policy "Authenticated users can upload project media" on storage.objects
for insert to authenticated with check (bucket_id = 'project-media');

create policy "Users can update their own project media" on storage.objects
for update to authenticated using (bucket_id = 'project-media');

create policy "Users can delete their own project media" on storage.objects
for delete to authenticated using (bucket_id = 'project-media');