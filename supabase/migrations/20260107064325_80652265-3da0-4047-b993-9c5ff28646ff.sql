-- Create content-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-images', 'content-images', true);

-- RLS: Anyone can view images
CREATE POLICY "Public read access for content images"
ON storage.objects FOR SELECT
USING (bucket_id = 'content-images');

-- RLS: Admins can upload images
CREATE POLICY "Admins can upload content images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- RLS: Admins can update images
CREATE POLICY "Admins can update content images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'content-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- RLS: Admins can delete images
CREATE POLICY "Admins can delete content images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'content-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Add full-text search to content_blocks
ALTER TABLE content_blocks 
ADD COLUMN IF NOT EXISTS search_vector tsvector 
GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, ''))) STORED;

CREATE INDEX IF NOT EXISTS content_blocks_search_idx 
ON content_blocks USING GIN (search_vector);

-- Add full-text search to projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS search_vector tsvector 
GENERATED ALWAYS AS (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
) STORED;

CREATE INDEX IF NOT EXISTS projects_search_idx 
ON projects USING GIN (search_vector);