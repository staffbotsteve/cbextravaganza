-- Allow anyone (including anonymous/unauthenticated) to insert vendor applications
CREATE POLICY "Anyone can submit vendor application"
ON public.vendors
FOR INSERT
WITH CHECK (true);
