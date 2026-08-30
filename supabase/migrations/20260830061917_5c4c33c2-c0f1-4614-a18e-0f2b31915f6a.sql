ALTER TABLE public.prompts
  ADD COLUMN IF NOT EXISTS prompt_blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tool_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_video boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_image boolean NOT NULL DEFAULT false;

-- Remove the seeded demo prompts (and their child rows)
DELETE FROM public.prompt_steps WHERE prompt_id IN (SELECT id FROM public.prompts);
DELETE FROM public.prompt_tools WHERE prompt_id IN (SELECT id FROM public.prompts);
DELETE FROM public.prompts;

DROP POLICY IF EXISTS "prompts author read" ON public.prompts;
DROP POLICY IF EXISTS "prompts author insert" ON public.prompts;
DROP POLICY IF EXISTS "prompts author update" ON public.prompts;
DROP POLICY IF EXISTS "prompts author delete" ON public.prompts;

CREATE POLICY "prompts author read" ON public.prompts FOR SELECT TO authenticated USING (author_id = auth.uid());
CREATE POLICY "prompts author insert" ON public.prompts FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "prompts author update" ON public.prompts FOR UPDATE TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY "prompts author delete" ON public.prompts FOR DELETE TO authenticated USING (author_id = auth.uid());