import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Store,
  HandHeart,
  LogOut,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const sidebarItems = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Sponsors", path: "/admin/sponsors", icon: HandHeart },
  { label: "Vendors", path: "/admin/vendors", icon: Store },
  { label: "Guests", path: "/admin/guests", icon: Users },
];

const AdminLayout = () => {
  const { user, signOut, isAdmin, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <p className="font-body text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    navigate("/admin/login");
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-muted">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-secondary text-secondary-foreground flex flex-col transition-transform lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-2 px-6 py-5 border-b border-secondary-foreground/10">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-display font-bold text-lg">CB Admin</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm font-semibold transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-secondary-foreground/70 hover:bg-secondary-foreground/10"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-secondary-foreground/10">
          <p className="px-3 text-xs text-secondary-foreground/50 font-body mb-2 truncate">
            {user.email}
          </p>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-secondary-foreground/70 hover:text-secondary-foreground font-body"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-background border-b border-border px-4 py-3 flex items-center gap-3 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="font-display font-bold text-lg text-foreground">
            {sidebarItems.find((i) => i.path === location.pathname)?.label ?? "Admin"}
          </h1>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
