-- Sync sponsorship levels with 2026 Sponsor Form PDF
UPDATE public.sponsorship_levels SET amount = 7500, description = 'First to commit, first to choose: Private Reserve, Beer Garden, Wine Courtyard, or Cooling Center', updated_at = now() WHERE name = 'Venue Sponsor';

UPDATE public.sponsorship_levels SET amount = 3500, description = 'Branded napkins & banner in Cigar Lounge, optional booth', updated_at = now() WHERE name = 'Cigar Lounge Sponsor';

UPDATE public.sponsorship_levels SET amount = 3500, description = 'Your logo on exclusive event whiskey glassware', updated_at = now() WHERE name = 'Whiskey Glass Sponsor';

UPDATE public.sponsorship_levels SET description = 'Last chance for exclusive 150th Anniversary logo glass!', updated_at = now() WHERE name = 'Wine Glass Sponsor';

UPDATE public.sponsorship_levels SET description = 'Over $600 fair market value!', updated_at = now() WHERE name = 'Falcon Sponsor';

-- Mark Main Stage Sponsor as SOLD OUT (no longer available per 2026 PDF)
UPDATE public.sponsorship_levels SET remaining_available = 0, updated_at = now() WHERE name = 'Main Stage Sponsor';