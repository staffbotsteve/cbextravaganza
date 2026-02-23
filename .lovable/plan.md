

# Christian Brothers Extravaganza — Enhanced Event Platform

Rebuild and enhance the existing CB Extravaganza website (currently on Wix) with powerful administrative tools, online payments, and AI-powered engagement via ElevenLabs.

---

## 1. Public Event Website (Migrated from Existing Site)

Recreate the look and feel of cbextravaganza.com with the same vibrant red & navy branding, bold typography, and event imagery.

- **Hero Section**: Full-width background image/video, "36th Annual Christian Brothers Extravaganza" headline, event date (Saturday, September 6, 2025), and prominent "Buy Tickets" CTA
- **Event Details**: Celebration of 150 years, mission (CBHS Tuition Assistance Fund), schedule, dress code
- **Entertainment Lineup**: Showcase Main Stage (Big Crush), Wine Courtyard (Don Rodriguez Group), Private Reserve (Kyle Tuttle '05) with photos
- **Presenting Sponsor**: CAPTRUST feature with logo
- **Vendors & Sponsors Grid**: Logo gallery of participating wineries, breweries, restaurants, and sponsors with links
- **Navigation**: Home, Tickets, Map, Vendors, Sponsors, Get Involved, Contact
- **Countdown Timer**: Live countdown to event day
- **Assets**: Migrate video, photos, logos, and branding collateral from the existing Wix site

## 2. Online Ticket Sales (Stripe Integration)

- Ticket tiers: Individual, Couple, Table of 8, VIP/Private Reserve
- Secure Stripe checkout with order confirmation
- Email receipt sent automatically to buyers
- Ticket inventory management from admin dashboard

## 3. Vendor Application Form

- Business name, contact info, type of goods/services, booth size, special requirements
- On-screen and email confirmation upon submission
- Admin can review, approve, or reject applications

## 4. Volunteer Sign-Up Form

- Name, contact info, availability, area of interest (setup, registration, cleanup, etc.)
- Confirmation displayed and emailed

## 5. Donor / Sponsorship Form

- Individual or business name, contact info, donation amount or sponsorship tier, optional message
- Confirmation displayed and emailed
- Sponsorship tiers with corresponding benefits listed

## 6. Admin Dashboard (Login Required)

- Secure admin login for CBHS staff
- **Ticket Sales**: View all purchases, totals, buyer details
- **Vendor Applications**: Review, approve, reject with status tracking
- **Volunteer List**: View sign-ups and preferences
- **Donor/Sponsor List**: View commitments and amounts
- **CSV Export** for every data section
- **Event Settings**: Update event details, entertainment, sponsors from the dashboard

## 7. ElevenLabs AI Integration

### AI Voice Agent (Phone-Style)
- Embedded voice widget on the site — visitors can talk to an AI concierge that answers event questions (date, location, parking, what to expect, dress code)

### AI Chatbot (Text)
- Text-based chat widget for visitors who prefer typing
- Same knowledge base as the voice agent — event FAQs, ticket info, vendor details

### AI Outreach Capabilities
- **Donor Solicitation**: AI can engage potential donors with personalized messaging about the Tuition Assistance Fund
- **Volunteer Recruitment**: AI helps recruit and onboard volunteers, answering questions about roles and time commitments
- **Vendor Onboarding**: AI guides prospective vendors through the application process
- **Automated Voice Messages**: Pre-recorded AI voice messages for confirmations, reminders, and follow-ups to guests, vendors, volunteers, and donors

## 8. Backend & Database (Supabase)

- Tables: tickets/orders, vendors, volunteers, donors/sponsors, admin users
- Admin authentication with role-based access
- Row-level security on all tables
- Edge functions for ElevenLabs token generation, email notifications, and Stripe webhooks

## 9. Email Notifications

- Automated confirmations for: ticket purchases, vendor applications, volunteer sign-ups, donations
- Event reminder emails to all registered guests

## Design & Branding

- Match the existing CB Extravaganza red (#C41230) and navy (#1B2A4A) color palette
- Bold, playful typography with rounded elements
- Video and imagery migrated from current Wix site
- Fully responsive for mobile and desktop

