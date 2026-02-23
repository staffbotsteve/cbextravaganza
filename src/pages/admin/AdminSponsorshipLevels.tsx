import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";

const AdminSponsorshipLevels = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newLevel, setNewLevel] = useState({ name: "", amount: "", total_available: "", tickets_included: "4", parking_included: "1", sort_order: "0", description: "" });

  const { data: levels, isLoading } = useQuery({
    queryKey: ["admin-sponsorship-levels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsorship_levels")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from("sponsorship_levels").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sponsorship-levels"] });
      toast({ title: "Updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!newLevel.name || !newLevel.amount) throw new Error("Name and amount required");
      const { error } = await supabase.from("sponsorship_levels").insert({
        name: newLevel.name,
        amount: Number(newLevel.amount),
        total_available: Number(newLevel.total_available) || 0,
        remaining_available: Number(newLevel.total_available) || 0,
        tickets_included: Number(newLevel.tickets_included) || 0,
        parking_included: Number(newLevel.parking_included) || 0,
        sort_order: Number(newLevel.sort_order) || 0,
        description: newLevel.description || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sponsorship-levels"] });
      setNewLevel({ name: "", amount: "", total_available: "", tickets_included: "4", parking_included: "1", sort_order: "0", description: "" });
      toast({ title: "Level added" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sponsorship_levels").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sponsorship-levels"] });
      toast({ title: "Deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  }

  return (
    <div>
      <h2 className="font-display font-bold text-xl text-foreground mb-4">Sponsorship Levels</h2>
      <div className="rounded-lg border border-border overflow-auto mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-body">Name</TableHead>
              <TableHead className="font-body text-right">Amount</TableHead>
              <TableHead className="font-body text-right">Total</TableHead>
              <TableHead className="font-body text-right">Remaining</TableHead>
              <TableHead className="font-body text-right">Tickets</TableHead>
              <TableHead className="font-body text-right">Parking</TableHead>
              <TableHead className="font-body text-right">Order</TableHead>
              <TableHead className="font-body">Active</TableHead>
              <TableHead className="font-body"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {levels?.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-body font-semibold">{l.name}</TableCell>
                <TableCell className="font-body text-right">${Number(l.amount).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    className="w-16 text-right inline-block"
                    defaultValue={l.total_available}
                    onBlur={(e) => updateMutation.mutate({ id: l.id, updates: { total_available: Number(e.target.value) } })}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    className="w-16 text-right inline-block"
                    defaultValue={l.remaining_available}
                    onBlur={(e) => updateMutation.mutate({ id: l.id, updates: { remaining_available: Number(e.target.value) } })}
                  />
                </TableCell>
                <TableCell className="font-body text-right">{l.tickets_included}</TableCell>
                <TableCell className="font-body text-right">{l.parking_included}</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    className="w-16 text-right inline-block"
                    defaultValue={l.sort_order}
                    onBlur={(e) => updateMutation.mutate({ id: l.id, updates: { sort_order: Number(e.target.value) } })}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={l.is_active}
                    onCheckedChange={(val) => updateMutation.mutate({ id: l.id, updates: { is_active: val } })}
                  />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(l.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add new level */}
      <div className="bg-muted rounded-lg p-4 space-y-3">
        <h3 className="font-display font-bold text-sm">Add New Level</h3>
        <div className="grid sm:grid-cols-4 gap-3">
          <Input placeholder="Name" value={newLevel.name} onChange={(e) => setNewLevel({ ...newLevel, name: e.target.value })} />
          <Input type="number" placeholder="Amount ($)" value={newLevel.amount} onChange={(e) => setNewLevel({ ...newLevel, amount: e.target.value })} />
          <Input type="number" placeholder="Total Available" value={newLevel.total_available} onChange={(e) => setNewLevel({ ...newLevel, total_available: e.target.value })} />
          <Input type="number" placeholder="Sort Order" value={newLevel.sort_order} onChange={(e) => setNewLevel({ ...newLevel, sort_order: e.target.value })} />
        </div>
        <Input placeholder="Description (optional)" value={newLevel.description} onChange={(e) => setNewLevel({ ...newLevel, description: e.target.value })} />
        <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending}>
          <Plus className="h-4 w-4 mr-1" /> Add Level
        </Button>
      </div>
    </div>
  );
};

export default AdminSponsorshipLevels;
