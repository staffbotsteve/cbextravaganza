import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Tickets from "./pages/Tickets";
import MapPage from "./pages/MapPage";
import Vendors from "./pages/Vendors";
import Sponsors from "./pages/Sponsors";
import GetInvolved from "./pages/GetInvolved";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminSponsors from "./pages/admin/AdminSponsors";
import AdminVendors from "./pages/admin/AdminVendors";
import AdminGuests from "./pages/admin/AdminGuests";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/get-involved" element={<GetInvolved />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="sponsors" element={<AdminSponsors />} />
              <Route path="vendors" element={<AdminVendors />} />
              <Route path="guests" element={<AdminGuests />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
