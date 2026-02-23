
-- Create sponsorship_levels table for dynamic sponsorship tiers
CREATE TABLE public.sponsorship_levels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  total_available integer NOT NULL DEFAULT 0,
  remaining_available integer NOT NULL DEFAULT 0,
  tickets_included integer NOT NULL DEFAULT 0,
  parking_included integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsorship_levels ENABLE ROW LEVEL SECURITY;

-- Anyone can view active sponsorship levels
CREATE POLICY "Anyone can view sponsorship levels"
  ON public.sponsorship_levels
  FOR SELECT
  TO public
  USING (true);

-- Admins can insert
CREATE POLICY "Admins can insert sponsorship levels"
  ON public.sponsorship_levels
  FOR INSERT
  TO public
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update
CREATE POLICY "Admins can update sponsorship levels"
  ON public.sponsorship_levels
  FOR UPDATE
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete
CREATE POLICY "Admins can delete sponsorship levels"
  ON public.sponsorship_levels
  FOR DELETE
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_sponsorship_levels_updated_at
  BEFORE UPDATE ON public.sponsorship_levels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Also allow anyone to insert into sponsors table (for the public form)
-- First drop the restrictive admin-only insert policy
DROP POLICY IF EXISTS "Admins can insert sponsors" ON public.sponsors;

-- Create permissive public insert policy
CREATE POLICY "Anyone can submit sponsor application"
  ON public.sponsors
  FOR INSERT
  TO public
  WITH CHECK (true);
