CREATE TABLE IF NOT EXISTS public.site_data (
  id integer PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.site_data TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_data TO authenticated;
GRANT ALL ON public.site_data TO service_role;

ALTER TABLE public.site_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_data_read" ON public.site_data FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "site_data_insert" ON public.site_data FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "site_data_update" ON public.site_data FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);