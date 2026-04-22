-- Phone types enum
CREATE TYPE public.phone_type AS ENUM ('mobile', 'office', 'home', 'fax', 'other', 'unknown');

-- Contact phones table (multiple per contact)
CREATE TABLE public.contact_phones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  phone_type public.phone_type NOT NULL DEFAULT 'unknown',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  sms_capable BOOLEAN NOT NULL DEFAULT true,
  last_sms_status TEXT,
  last_sms_error_code TEXT,
  last_checked_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_contact_phones_contact_id ON public.contact_phones(contact_id);
CREATE INDEX idx_contact_phones_phone ON public.contact_phones(phone);

ALTER TABLE public.contact_phones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view contact_phones"
  ON public.contact_phones FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert contact_phones"
  ON public.contact_phones FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update contact_phones"
  ON public.contact_phones FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete contact_phones"
  ON public.contact_phones FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_contact_phones_updated_at
  BEFORE UPDATE ON public.contact_phones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing contact.phone values
INSERT INTO public.contact_phones (contact_id, phone, phone_type, is_primary)
SELECT id, phone, 'unknown'::public.phone_type, true
FROM public.contacts
WHERE phone IS NOT NULL AND phone <> '';

-- Track which phone was used for a campaign send
ALTER TABLE public.campaign_recipients
  ADD COLUMN contact_phone_id UUID REFERENCES public.contact_phones(id) ON DELETE SET NULL;