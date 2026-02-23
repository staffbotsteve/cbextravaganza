-- Allow anyone to update a vendor record (for re-submission of applications)
CREATE POLICY "Anyone can update vendor application"
ON public.vendors
FOR UPDATE
USING (true)
WITH CHECK (true);