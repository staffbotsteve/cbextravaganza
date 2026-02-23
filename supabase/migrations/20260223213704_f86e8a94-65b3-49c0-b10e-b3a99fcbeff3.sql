
-- Drop the restrictive public policies
DROP POLICY IF EXISTS "Anyone can submit vendor application" ON public.vendors;
DROP POLICY IF EXISTS "Anyone can update vendor application" ON public.vendors;
DROP POLICY IF EXISTS "Anyone can view vendors" ON public.vendors;

-- Recreate as PERMISSIVE (the default)
CREATE POLICY "Anyone can submit vendor application"
  ON public.vendors
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update vendor application"
  ON public.vendors
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view vendors"
  ON public.vendors
  FOR SELECT
  TO public
  USING (true);
