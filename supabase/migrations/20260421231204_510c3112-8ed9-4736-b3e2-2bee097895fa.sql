ALTER TABLE public.participation
  ADD COLUMN IF NOT EXISTS vendor_type text,
  ADD COLUMN IF NOT EXISTS product_description text,
  ADD COLUMN IF NOT EXISTS wine_quantity text,
  ADD COLUMN IF NOT EXISTS other_beverage_quantity text,
  ADD COLUMN IF NOT EXISTS representatives text[],
  ADD COLUMN IF NOT EXISTS preferred_venue text,
  ADD COLUMN IF NOT EXISTS donate_only boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS cb_solicitor text;

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS email text;

CREATE INDEX IF NOT EXISTS idx_participation_year_role ON public.participation(year, role);
CREATE INDEX IF NOT EXISTS idx_organizations_name_lower ON public.organizations(lower(name));