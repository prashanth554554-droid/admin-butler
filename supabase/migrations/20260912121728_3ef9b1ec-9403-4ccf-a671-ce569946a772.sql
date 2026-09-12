ALTER TABLE public.prompts
ADD COLUMN descriptions jsonb NOT NULL DEFAULT '[]'::jsonb;