CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email, NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  featured_image_url TEXT,
  featured_video_url TEXT,
  content_type TEXT NOT NULL DEFAULT 'tutorial' CHECK (content_type IN ('tutorial','article','guide')),
  tools TEXT[] NOT NULL DEFAULT '{}',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  author_id UUID,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  featured BOOLEAN NOT NULL DEFAULT false,
  views INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts public read" ON public.posts FOR SELECT USING (status = 'published');
CREATE POLICY "posts admin read" ON public.posts FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "posts admin write" ON public.posts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER posts_updated BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  prompt_type TEXT NOT NULL DEFAULT 'ai_image' CHECK (prompt_type IN ('ai_image','ai_video','cinematic','character','birthday','wedding','reels','advertisement','animation')),
  image_prompt TEXT,
  video_prompt TEXT,
  negative_prompt TEXT,
  tool_name TEXT,
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner','intermediate','advanced')),
  estimated_time TEXT,
  featured_image_url TEXT,
  example_video_url TEXT,
  prompt_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  tool_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_prompts JSONB NOT NULL DEFAULT '[]'::jsonb,
  video_prompts JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_video BOOLEAN NOT NULL DEFAULT false,
  is_image BOOLEAN NOT NULL DEFAULT false,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  author_id UUID,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  featured BOOLEAN NOT NULL DEFAULT false,
  views INTEGER NOT NULL DEFAULT 0,
  copy_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.prompts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prompts TO authenticated;
GRANT ALL ON public.prompts TO service_role;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prompts public read" ON public.prompts FOR SELECT USING (status = 'published');
CREATE POLICY "prompts admin read" ON public.prompts FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "prompts admin write" ON public.prompts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "prompts author read" ON public.prompts FOR SELECT TO authenticated USING (author_id = auth.uid());
CREATE POLICY "prompts author insert" ON public.prompts FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "prompts author update" ON public.prompts FOR UPDATE TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY "prompts author delete" ON public.prompts FOR DELETE TO authenticated USING (author_id = auth.uid());
CREATE TRIGGER prompts_updated BEFORE UPDATE ON public.prompts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.prompt_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  tool_url TEXT
);
GRANT SELECT ON public.prompt_tools TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prompt_tools TO authenticated;
GRANT ALL ON public.prompt_tools TO service_role;
ALTER TABLE public.prompt_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prompt_tools public read" ON public.prompt_tools FOR SELECT USING (true);
CREATE POLICY "prompt_tools admin write" ON public.prompt_tools FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.prompt_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL DEFAULT 1,
  title TEXT,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.prompt_steps TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prompt_steps TO authenticated;
GRANT ALL ON public.prompt_steps TO service_role;
ALTER TABLE public.prompt_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prompt_steps public read" ON public.prompt_steps FOR SELECT USING (true);
CREATE POLICY "prompt_steps admin write" ON public.prompt_steps FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_url TEXT NOT NULL,
  storage_path TEXT,
  alt_text TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media TO authenticated;
GRANT ALL ON public.media TO service_role;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media admin all" ON public.media FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  model TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_providers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_providers TO authenticated;
GRANT ALL ON public.ai_providers TO service_role;
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "providers public read" ON public.ai_providers FOR SELECT USING (true);
CREATE POLICY "providers admin write" ON public.ai_providers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.video_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT,
  input_image_url TEXT,
  input_video_url TEXT,
  generated_video_url TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','processing','completed','failed')),
  provider_job_id TEXT,
  error_message TEXT,
  duration INTEGER,
  aspect_ratio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.video_generations TO authenticated;
GRANT ALL ON public.video_generations TO service_role;
ALTER TABLE public.video_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own generations" ON public.video_generations FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER video_generations_updated BEFORE UPDATE ON public.video_generations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "site media read" ON storage.objects FOR SELECT USING (bucket_id IN ('public-images','videos'));
CREATE POLICY "admin site media write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('public-images','videos') AND public.is_admin());
CREATE POLICY "admin site media update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('public-images','videos') AND public.is_admin());
CREATE POLICY "admin site media delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('public-images','videos') AND public.is_admin());
CREATE POLICY "own uploads read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'uploads' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin()));
CREATE POLICY "own uploads write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own uploads delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'uploads' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin()));

INSERT INTO public.categories (name, slug, description, icon) VALUES
 ('AI Video','ai-video','Cinematic and creative AI video prompts','Clapperboard'),
 ('AI Image','ai-image','High quality AI image prompts','Image'),
 ('Cinematic','cinematic','Film-grade cinematic looks and camera moves','Film'),
 ('Character','character','Consistent AI characters and portraits','User'),
 ('Birthday','birthday','Celebration and birthday video ideas','Cake'),
 ('Wedding','wedding','Romantic wedding cinematics','Heart'),
 ('Instagram Reels','instagram-reels','Short-form vertical video prompts','Smartphone'),
 ('Cartoon Stories','cartoon-stories','Animated cartoon storytelling','Sparkles'),
 ('Business Ads','business-ads','Product and advertisement videos','Megaphone'),
 ('Logo Animation','logo-animation','Animated logo reveals','Zap');

INSERT INTO public.ai_providers (name, slug, model, enabled, description) VALUES
 ('Veo 3.1 Lite','veo-lite','google/veo-3.1-lite', true, 'Fast, cost efficient text-to-video and image-to-video'),
 ('Veo 3.1 Fast','veo-fast','google/veo-3.1-fast', true, 'Higher quality video generation'),
 ('Veo 3.1','veo','google/veo-3.1', true, 'Highest quality video generation'),
 ('Runway','runway', NULL, false, 'API not connected yet'),
 ('Kling','kling', NULL, false, 'API not connected yet');

INSERT INTO public.posts (title, slug, excerpt, content, content_type, tools, category_id, status, featured, published_at)
SELECT v.title, v.slug, v.excerpt, v.content, v.ctype, v.tools, (SELECT id FROM public.categories c WHERE c.slug = v.cat), 'published', v.feat, now() - (v.days || ' days')::interval
FROM (VALUES
 ('How to Create Cinematic AI Videos From a Single Image','create-cinematic-ai-videos-from-one-image','Turn one still frame into a moving cinematic shot with a repeatable prompt workflow.','Start with a strong keyframe. A cinematic AI video is only as good as the image it animates, so spend most of your effort on composition, lighting and lens choice before you ever touch a video model.

Once your frame is ready, describe motion in a single clear sentence: what the camera does, what the subject does, and what the light does. Avoid stacking five different movements, because models blend them into mush.

Finally, lock your look with a negative prompt. Removing text artifacts, distortion and oversaturation is usually enough to lift a clip from amateur to professional.','tutorial', ARRAY['Veo 3.1','Midjourney'], 'cinematic', true, 2),
 ('Prompt Structure That Actually Works','prompt-structure-that-actually-works','A simple five part formula for consistent AI results.','Every reliable prompt follows the same skeleton: subject, environment, lighting, lens, and grade. Write them in that order and your outputs become predictable.

Subject first tells the model what matters. Environment sets context. Lighting and lens control realism more than any style keyword. The grade is the final 10 percent that makes it feel intentional.

Keep each part to a handful of words. Long prompts do not mean better prompts.','guide', ARRAY['Midjourney','Veo 3.1'], 'ai-image', true, 5),
 ('Building Consistent AI Characters','building-consistent-ai-characters','Keep the same face, outfit and vibe across an entire story.','Character consistency comes from constraint, not luck. Lock a reference image, describe the face with concrete features instead of adjectives, and reuse the exact same wording every time.

Generate a turnaround sheet before you make any scenes. It becomes your source of truth for every later shot.','tutorial', ARRAY['Midjourney'], 'character', false, 7),
 ('Making Instagram Reels With AI in Under 10 Minutes','ai-instagram-reels-under-10-minutes','A fast pipeline from idea to published vertical video.','Vertical video rewards momentum. Plan three beats: hook, payoff, loop. Each beat is one generated clip of two to three seconds.

Generate in 9:16 natively rather than cropping. Cropping wastes resolution and usually cuts your subject in half.','tutorial', ARRAY['Veo 3.1 Fast'], 'instagram-reels', false, 9),
 ('AI Wedding Films: A Complete Workflow','ai-wedding-films-complete-workflow','Romantic, film-grade wedding sequences from prompts.','Wedding work lives and dies on warmth. Choose golden hour, soft bokeh and gentle camera motion, then resist the urge to over-direct.

Build the sequence as wide, medium, close. That rhythm reads as a real film even when every frame is generated.','tutorial', ARRAY['Veo 3.1'], 'wedding', false, 12),
 ('Product Ads With AI Video','product-ads-with-ai-video','Commercial-quality product spots without a studio.','Commercial video is about surfaces. Describe material, reflection and light sweep, and the model will do the rest.

Keep the product static and move the camera. Moving both at once almost always warps the product.','guide', ARRAY['Veo 3.1'], 'business-ads', true, 14),
 ('Animating Logos With AI','animating-logos-with-ai','Liquid metal, particles and clean brand reveals.','Logo animation needs a hard constraint: the final frame must be your exact logo. Generate the motion, then composite the real logo on the last frame.

Liquid metal, ink bloom and particle assembly are the three reveals that consistently look premium.','tutorial', ARRAY['Veo 3.1 Fast'], 'logo-animation', false, 18),
 ('Negative Prompts Explained','negative-prompts-explained','What to exclude, and why it matters more than you think.','Negative prompts are a cleanup pass, not a style tool. Use them to remove failure modes: distorted hands, watermarks, text artifacts, mushy detail.

Do not use them to add style. If you want warmth, ask for warmth in the positive prompt.','article', ARRAY['Midjourney','Veo 3.1'], 'ai-image', false, 21)
) AS v(title, slug, excerpt, content, ctype, tools, cat, feat, days);