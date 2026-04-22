import { MessageSquare } from "lucide-react";

interface SmsConsentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Compact variant for tight UIs like the ticket card */
  compact?: boolean;
  id?: string;
}

/**
 * Reusable SMS opt-in consent block.
 * Default state is opt-in (checked) but the user can uncheck.
 * Renders the disclosure language Twilio reviewers look for.
 */
const SmsConsent = ({ checked, onChange, compact = false, id = "sms-opt-in" }: SmsConsentProps) => {
  if (compact) {
    return (
      <label htmlFor={id} className="flex items-start gap-2 cursor-pointer rounded-lg border border-border bg-muted/30 p-2.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 accent-primary h-3.5 w-3.5"
        />
        <span className="font-body text-foreground text-[11px] leading-snug">
          Text me event updates from CB Extravaganza. Msg & data rates may apply. Reply STOP to opt out, HELP for help.
        </span>
      </label>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <label htmlFor={id} className="flex items-start gap-3 cursor-pointer">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 accent-primary h-4 w-4"
        />
        <div className="space-y-1">
          <p className="font-body font-semibold text-foreground text-sm flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-primary" />
            Yes, send me SMS updates about CB Extravaganza
          </p>
          <p className="font-body text-muted-foreground text-xs leading-snug">
            By checking this box, you agree to receive event-related text messages
            (confirmations, schedule updates, day-of logistics) from Christian Brothers
            High School Extravaganza at the phone number provided. Message frequency varies.
            Message &amp; data rates may apply. Reply <strong>STOP</strong> to unsubscribe at any time,
            or <strong>HELP</strong> for help. Consent is not a condition of purchase. See our{" "}
            <a href="/privacy" className="text-primary underline">Privacy Policy</a>.
          </p>
        </div>
      </label>
    </div>
  );
};

export default SmsConsent;
