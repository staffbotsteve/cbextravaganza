import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import DonationSuccess from "./pages/DonationSuccess";
import Tickets from "./pages/Tickets";
import MapPage from "./pages/MapPage";
import Vendors from "./pages/Vendors";
import Sponsors from "./pages/Sponsors";
import SponsorApply from "./pages/SponsorApply";
import GetInvolved from "./pages/GetInvolved";
import VendorApply from "./pages/VendorApply";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminOrganizations from "./pages/admin/AdminOrganizations";
import AdminContacts from "./pages/admin/AdminContacts";
import AdminActivities from "./pages/admin/AdminActivities";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminGuests from "./pages/admin/AdminGuests";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSponsorshipLevels from "./pages/admin/AdminSponsorshipLevels";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminCampaigns from "./pages/admin/AdminCampaigns";
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
            <Route path="/donation-success" element={<DonationSuccess />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/vendors/apply" element={<VendorApply />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/sponsors/apply" element={<SponsorApply />} />
            <Route path="/get-involved" element={<GetInvolved />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="organizations" element={<AdminOrganizations />} />
              <Route path="contacts" element={<AdminContacts />} />
              <Route path="activities" element={<AdminActivities />} />
              <Route path="documents" element={<AdminDocuments />} />
              <Route path="guests" element={<AdminGuests />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="sponsorship-levels" element={<AdminSponsorshipLevels />} />
              <Route path="tickets" element={<AdminTickets />} />
              <Route path="campaigns" element={<AdminCampaigns />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
