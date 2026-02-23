import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Ticket, Package, Save } from "lucide-react";

type Purchase = {
  id: string;
  email: string | null;
  stripe_session_id: string | null;
  general_qty: number;
  vip_qty: number;
  parking_qty: number;
  donation_amount: number;
  total_cents: number;
  payment_status: string;
  created_at: string;
};

type Inventory = {
  id: string;
  ticket_type: string;
  label: string;
  price_cents: number;
  total_available: number;
  remaining_available: number;
  is_active: boolean;
  sort_order: number;
};

const AdminTickets = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingInventory, setEditingInventory] = useState<Record<string, Partial<Inventory>>>({});

  const fetchData = async () => {
    setLoading(true);
    const [purchasesRes, inventoryRes] = await Promise.all([
      supabase.from("ticket_purchases").select("*").order("created_at", { ascending: false }),
      supabase.from("ticket_inventory").select("*").order("sort_order"),
    ]);
    if (purchasesRes.data) setPurchases(purchasesRes.data);
    if (inventoryRes.data) setInventory(inventoryRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInventoryChange = (id: string, field: string, value: string | number | boolean) => {
    setEditingInventory((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const saveInventory = async (id: string) => {
    const updates = editingInventory[id];
    if (!updates) return;
    const { error } = await supabase.from("ticket_inventory").update(updates).eq("id", id);
    if (error) {
      toast.error("Failed to update inventory");
    } else {
      toast.success("Inventory updated");
      setEditingInventory((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      fetchData();
    }
  };

  const getVal = (item: Inventory, field: keyof Inventory) => {
    return editingInventory[item.id]?.[field] ?? item[field];
  };

  const totalRevenue = purchases.reduce((s, p) => s + p.total_cents, 0);
  const totalGA = purchases.reduce((s, p) => s + p.general_qty, 0);
  const totalVIP = purchases.reduce((s, p) => s + p.vip_qty, 0);
  const totalParking = purchases.reduce((s, p) => s + p.parking_qty, 0);

  if (loading) {
    return <p className="font-body text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-body text-sm text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display font-bold text-2xl">${(totalRevenue / 100).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-body text-sm text-muted-foreground">GA Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display font-bold text-2xl">{totalGA}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-body text-sm text-muted-foreground">VIP Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display font-bold text-2xl">{totalVIP}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-body text-sm text-muted-foreground">Parking Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display font-bold text-2xl">{totalParking}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="purchases">
        <TabsList>
          <TabsTrigger value="purchases" className="font-body">
            <Ticket className="h-4 w-4 mr-1.5" /> Purchases
          </TabsTrigger>
          <TabsTrigger value="inventory" className="font-body">
            <Package className="h-4 w-4 mr-1.5" /> Inventory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchases">
          <Card>
            <CardContent className="pt-6 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">GA</TableHead>
                    <TableHead className="text-center">VIP</TableHead>
                    <TableHead className="text-center">Parking</TableHead>
                    <TableHead className="text-right">Donation</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground font-body">
                        No purchases yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    purchases.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-body text-sm whitespace-nowrap">
                          {new Date(p.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-body text-sm">{p.email || "—"}</TableCell>
                        <TableCell className="font-body text-sm text-center">{p.general_qty}</TableCell>
                        <TableCell className="font-body text-sm text-center">{p.vip_qty}</TableCell>
                        <TableCell className="font-body text-sm text-center">{p.parking_qty}</TableCell>
                        <TableCell className="font-body text-sm text-right">
                          {p.donation_amount > 0 ? `$${p.donation_amount}` : "—"}
                        </TableCell>
                        <TableCell className="font-body text-sm text-right font-semibold">
                          ${(p.total_cents / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={p.payment_status === "paid" ? "default" : "secondary"}
                            className="font-body text-xs"
                          >
                            {p.payment_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardContent className="pt-6 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Remaining</TableHead>
                    <TableHead className="text-center">Active</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-body text-sm font-semibold">{inv.ticket_type}</TableCell>
                      <TableCell>
                        <Input
                          value={String(getVal(inv, "label"))}
                          onChange={(e) => handleInventoryChange(inv.id, "label", e.target.value)}
                          className="h-8 text-sm font-body w-40"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={String(Number(getVal(inv, "price_cents")) / 100)}
                          onChange={(e) =>
                            handleInventoryChange(inv.id, "price_cents", Math.round(Number(e.target.value) * 100))
                          }
                          className="h-8 text-sm font-body w-20 text-right ml-auto"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          value={String(getVal(inv, "total_available"))}
                          onChange={(e) =>
                            handleInventoryChange(inv.id, "total_available", Number(e.target.value))
                          }
                          className="h-8 text-sm font-body w-20 text-center mx-auto"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          value={String(getVal(inv, "remaining_available"))}
                          onChange={(e) =>
                            handleInventoryChange(inv.id, "remaining_available", Number(e.target.value))
                          }
                          className="h-8 text-sm font-body w-20 text-center mx-auto"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(getVal(inv, "is_active"))}
                          onChange={(e) => handleInventoryChange(inv.id, "is_active", e.target.checked)}
                          className="accent-primary"
                        />
                      </TableCell>
                      <TableCell>
                        {editingInventory[inv.id] && (
                          <Button size="sm" onClick={() => saveInventory(inv.id)} className="font-body">
                            <Save className="h-3.5 w-3.5 mr-1" /> Save
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTickets;
