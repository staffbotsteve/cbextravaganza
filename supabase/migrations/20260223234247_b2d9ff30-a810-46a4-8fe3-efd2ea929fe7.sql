
-- Fix ticket_inventory SELECT policy to be PERMISSIVE
DROP POLICY IF EXISTS "Anyone can view ticket inventory" ON public.ticket_inventory;
CREATE POLICY "Anyone can view ticket inventory"
ON public.ticket_inventory
FOR SELECT
USING (true);

-- Fix ticket_purchases INSERT policy to be PERMISSIVE
DROP POLICY IF EXISTS "Anyone can insert purchase" ON public.ticket_purchases;
CREATE POLICY "Anyone can insert purchase"
ON public.ticket_purchases
FOR INSERT
WITH CHECK (true);
