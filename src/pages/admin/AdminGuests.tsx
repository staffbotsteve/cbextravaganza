import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const AdminGuests = () => {
  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="font-display text-lg">Guest Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="font-body text-muted-foreground">
          <p>
            Guest and ticket management is coming soon. This section will include ticket
            purchases, guest lists, check-in tracking, and integrations with Twilio and
            ElevenLabs for guest communications.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGuests;
