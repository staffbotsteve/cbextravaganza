import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Trash2, Loader2, ShieldCheck } from "lucide-react";

interface AdminUser {
  user_id: string;
  email: string;
  full_name: string | null;
}

const AdminUsers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    const { data, error } = await supabase.functions.invoke("list-admin-users");
    if (error) {
      toast({ title: "Error", description: "Failed to load admins", variant: "destructive" });
    } else {
      setAdmins(data?.admins ?? []);
    }
    setLoadingAdmins(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const { data, error } = await supabase.functions.invoke("create-admin-user", {
      body: { email: newEmail, password: newPassword, full_name: newName },
    });
    setCreating(false);
    if (error || data?.error) {
      toast({
        title: "Error",
        description: data?.error || "Failed to create admin",
        variant: "destructive",
      });
    } else {
      toast({ title: "Admin created", description: `${newEmail} is now an admin.` });
      setNewEmail("");
      setNewName("");
      setNewPassword("");
      setDialogOpen(false);
      fetchAdmins();
    }
  };

  const handleRemove = async (targetUserId: string) => {
    if (targetUserId === user?.id) {
      toast({ title: "Error", description: "You cannot remove yourself.", variant: "destructive" });
      return;
    }
    setRemoving(targetUserId);
    const { data, error } = await supabase.functions.invoke("remove-admin-role", {
      body: { target_user_id: targetUserId },
    });
    setRemoving(null);
    if (error || data?.error) {
      toast({
        title: "Error",
        description: data?.error || "Failed to remove admin",
        variant: "destructive",
      });
    } else {
      toast({ title: "Removed", description: "Admin role removed." });
      fetchAdmins();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-foreground">Administrators</h2>
          <p className="font-body text-muted-foreground text-sm">
            Manage who has admin access to the dashboard.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-body font-bold gap-2">
              <UserPlus className="h-4 w-4" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Add New Administrator</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div>
                <Label className="font-body">Full Name</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  className="font-body"
                />
              </div>
              <div>
                <Label className="font-body">Email</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="admin@cbhs.org"
                  required
                  className="font-body"
                />
              </div>
              <div>
                <Label className="font-body">Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="font-body"
                />
              </div>
              <Button type="submit" className="w-full font-body font-bold" disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Admin"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loadingAdmins ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : admins.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-body text-muted-foreground">No administrators found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {admins.map((admin) => (
            <Card key={admin.user_id}>
              <CardContent className="flex items-center justify-between py-4 px-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-body font-semibold text-foreground text-sm">
                      {admin.full_name || "No name"}
                    </p>
                    <p className="font-body text-muted-foreground text-xs">{admin.email}</p>
                  </div>
                </div>
                {admin.user_id !== user?.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemove(admin.user_id)}
                    disabled={removing === admin.user_id}
                  >
                    {removing === admin.user_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
