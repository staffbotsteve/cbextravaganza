-- Drop the restrictive admin-only insert policy that blocks public submissions
DROP POLICY IF EXISTS "Admins can insert vendors" ON public.vendors;
