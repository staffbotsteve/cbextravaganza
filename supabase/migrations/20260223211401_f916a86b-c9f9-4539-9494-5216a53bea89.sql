-- Drop the existing RESTRICTIVE policies for public insert/update
DROP POLICY IF EXISTS "Anyone can submit vendor application" ON public.vendors;
DROP POLICY IF EXISTS "Anyone can update vendor application" ON public.vendors;

-- Recreate as PERMISSIVE (default) so anonymous users can actually submit
CREATE POLICY "Anyone can submit vendor application"
ON public.vendors
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update vendor application"
ON public.vendors
FOR UPDATE
USING (true)
WITH CHECK (true);