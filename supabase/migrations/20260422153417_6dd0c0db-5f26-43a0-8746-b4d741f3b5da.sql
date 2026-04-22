
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS sms_opt_in boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sms_opt_in_at timestamptz,
  ADD COLUMN IF NOT EXISTS sms_opt_in_source text,
  ADD COLUMN IF NOT EXISTS sms_opt_in_url text,
  ADD COLUMN IF NOT EXISTS sms_opt_in_ip text;

ALTER TABLE public.ticket_purchases
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS sms_opt_in boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sms_opt_in_at timestamptz,
  ADD COLUMN IF NOT EXISTS sms_opt_in_source text;
