
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_deactivated boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deactivated_at timestamp with time zone;
