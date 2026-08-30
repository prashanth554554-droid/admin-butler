DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP POLICY IF EXISTS "site media read" ON storage.objects;
DROP POLICY IF EXISTS "admin site media write" ON storage.objects;
DROP POLICY IF EXISTS "admin site media update" ON storage.objects;
DROP POLICY IF EXISTS "admin site media delete" ON storage.objects;
DROP POLICY IF EXISTS "own uploads read" ON storage.objects;
DROP POLICY IF EXISTS "own uploads write" ON storage.objects;
DROP POLICY IF EXISTS "own uploads delete" ON storage.objects;
CREATE POLICY "site media read" ON storage.objects FOR SELECT USING (bucket_id IN ('public-images','videos'));
CREATE POLICY "admin site media write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('public-images','videos') AND public.is_admin());
CREATE POLICY "admin site media update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('public-images','videos') AND public.is_admin());
CREATE POLICY "admin site media delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('public-images','videos') AND public.is_admin());
CREATE POLICY "own uploads read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'uploads' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin()));
CREATE POLICY "own uploads write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own uploads delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'uploads' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin()));