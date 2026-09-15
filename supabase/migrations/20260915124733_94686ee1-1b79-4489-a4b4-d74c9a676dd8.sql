CREATE POLICY "product_media_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'product-media');
CREATE POLICY "product_media_insert" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'product-media');
CREATE POLICY "product_media_update" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'product-media') WITH CHECK (bucket_id = 'product-media');
CREATE POLICY "product_media_delete" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'product-media');