
-- Ticket inventory to track availability
CREATE TABLE public.ticket_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_type text NOT NULL UNIQUE,
  label text NOT NULL,
  price_cents integer NOT NULL,
  stripe_price_id text NOT NULL,
  total_available integer NOT NULL DEFAULT 0,
  remaining_available integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ticket inventory" ON public.ticket_inventory FOR SELECT USING (true);
CREATE POLICY "Admins can insert ticket inventory" ON public.ticket_inventory FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update ticket inventory" ON public.ticket_inventory FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete ticket inventory" ON public.ticket_inventory FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_ticket_inventory_updated_at
  BEFORE UPDATE ON public.ticket_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed inventory
INSERT INTO public.ticket_inventory (ticket_type, label, price_cents, stripe_price_id, total_available, remaining_available, sort_order) VALUES
  ('general', 'General Admission', 7500, 'price_1T48UrDpYIyW3XDRYMdeBJrk', 300, 300, 1),
  ('vip', 'VIP Private Reserve', 15000, 'price_1T48V4DpYIyW3XDRT7n3xtQj', 100, 100, 2),
  ('parking', 'Parking Pass', 2500, 'price_1T48VFDpYIyW3XDRLLhHtVTM', 100, 100, 3);

-- Ticket purchases to track orders
CREATE TABLE public.ticket_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  stripe_session_id text,
  general_qty integer NOT NULL DEFAULT 0,
  vip_qty integer NOT NULL DEFAULT 0,
  parking_qty integer NOT NULL DEFAULT 0,
  donation_amount numeric DEFAULT 0,
  total_cents integer NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view purchases" ON public.ticket_purchases FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can insert purchase" ON public.ticket_purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update purchases" ON public.ticket_purchases FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete purchases" ON public.ticket_purchases FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_ticket_purchases_updated_at
  BEFORE UPDATE ON public.ticket_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
