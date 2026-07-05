import { Lead, Company, Contact, ScraperRun, SourceHealth } from "./types";

export const mockLeads: Lead[] = [
  { id: "LD001", companyName: "Spice Route Kitchen", contactName: "Rahul Mehta", product: "Dilivygo", industry: "Restaurant", market: "USA", country: "USA", city: "New York", source: "Reddit", sourceUrl: "https://reddit.com/r/restaurants/abc123", leadScore: 92, intentLevel: "Hot Lead", status: "New", painPoints: ["missed phone orders", "manual reconciliation", "delivery tablets"], suggestedAngle: "Streamline multi-platform order management", aiSummary: "Restaurant owner frustrated with managing 5 delivery tablets. Actively seeking KDS solution.", assignedUser: "Alex J.", createdAt: "2025-07-03", updatedAt: "2025-07-04", lastSeenAt: "2025-07-04", duplicateKey: "spice-route-kitchen-usa-new-york" },
  { id: "LD002", companyName: "Urban Plates", contactName: "Sarah Chen", product: "Dilivygo", industry: "Cloud Kitchen", market: "UK", country: "UK", city: "London", source: "LinkedIn", sourceUrl: "https://linkedin.com/posts/urban-plates", leadScore: 87, intentLevel: "Hot Lead", status: "Contacted", painPoints: ["food cost tracking", "inventory waste"], suggestedAngle: "AI-powered food cost optimization", aiSummary: "Cloud kitchen group with 12 locations. Currently using Toast but unhappy with reporting.", assignedUser: "Sarah M.", createdAt: "2025-07-02", updatedAt: "2025-07-04", lastSeenAt: "2025-07-04", duplicateKey: "urban-plates-uk-london" },
  { id: "LD003", companyName: "Horizon Realty Group", contactName: "Mike Torres", product: "Marlin", industry: "Real Estate", market: "USA", country: "USA", city: "Miami", source: "Google Maps", sourceUrl: "https://google.com/maps/horizon-realty", leadScore: 78, intentLevel: "Warm Lead", status: "Qualified", painPoints: ["tenant management", "rent collection"], suggestedAngle: "Automated tenant communication & rent tracking", aiSummary: "Property management firm with 200+ units. Using Yardi but considering alternatives.", assignedUser: "Mike R.", createdAt: "2025-07-01", updatedAt: "2025-07-03", lastSeenAt: "2025-07-03", duplicateKey: "horizon-realty-usa-miami" },
  { id: "LD004", companyName: "Green Ledger Accounting", contactName: "Priya Sharma", product: "Terro", industry: "Accounting", market: "GCC", country: "UAE", city: "Dubai", source: "LinkedIn", sourceUrl: "https://linkedin.com/company/green-ledger", leadScore: 85, intentLevel: "Hot Lead", status: "New", painPoints: ["ZATCA compliance", "e-invoicing", "VAT return"], suggestedAngle: "ZATCA-compliant e-invoicing automation", aiSummary: "Accounting firm struggling with UAE tax compliance. Needs automated e-invoicing.", assignedUser: "Alex J.", createdAt: "2025-07-03", updatedAt: "2025-07-04", lastSeenAt: "2025-07-04", duplicateKey: "green-ledger-gcc-dubai" },
  { id: "LD005", companyName: "Seaside Boutique Hotel", contactName: "Emma Williams", product: "Haigo", industry: "Hospitality", market: "Australia", country: "Australia", city: "Sydney", source: "Website", sourceUrl: "https://seasidehotel.com.au/contact", leadScore: 72, intentLevel: "Warm Lead", status: "Contacted", painPoints: ["overbooking", "guest management", "OTA commissions"], suggestedAngle: "Direct booking engine to reduce OTA dependency", aiSummary: "45-room boutique hotel paying high OTA commissions. Interested in direct booking solutions.", assignedUser: "Sarah M.", createdAt: "2025-06-30", updatedAt: "2025-07-02", lastSeenAt: "2025-07-02", duplicateKey: "seaside-boutique-australia-sydney" },
  { id: "LD006", companyName: "Taco Fiesta Chain", contactName: "Carlos Rodriguez", product: "Dilivygo", industry: "Fast Food", market: "USA", country: "USA", city: "Los Angeles", source: "Reddit", sourceUrl: "https://reddit.com/r/smallbusiness/def456", leadScore: 65, intentLevel: "Warm Lead", status: "Follow-up Scheduled", painPoints: ["delivery tablets", "missed orders"], suggestedAngle: "Consolidate all delivery platforms into one system", aiSummary: "QSR chain with 8 locations. Currently using DoorDash, Uber Eats, and GrubHub separately.", assignedUser: "Alex J.", createdAt: "2025-06-28", updatedAt: "2025-07-01", lastSeenAt: "2025-07-01", duplicateKey: "taco-fiesta-usa-los-angeles" },
  { id: "LD007", companyName: "Metro Property Solutions", contactName: "David Kim", product: "Marlin", industry: "Property Management", market: "UK", country: "UK", city: "Manchester", source: "Directory", sourceUrl: "https://realestate-directory.co.uk/metro", leadScore: 55, intentLevel: "Pain Signal", status: "Needs Review", painPoints: ["maintenance requests"], suggestedAngle: "Streamline maintenance request workflows", aiSummary: "Mid-size property manager. Limited pain signals but open to demos.", assignedUser: "Unassigned", createdAt: "2025-06-29", updatedAt: "2025-07-01", lastSeenAt: "2025-07-01", duplicateKey: "metro-property-uk-manchester" },
  { id: "LD008", companyName: "Pacific Tax Advisory", contactName: "Lisa Chang", product: "Terro", industry: "Tax Consulting", market: "Australia", country: "Australia", city: "Melbourne", source: "X / Twitter", sourceUrl: "https://x.com/pacifictax/status/123", leadScore: 45, intentLevel: "Pain Signal", status: "New", painPoints: ["month-end close", "reconciliation"], suggestedAngle: "Accelerate month-end close with automated reconciliation", aiSummary: "Tax consultancy posting about month-end close pain. Moderate intent signal.", assignedUser: "Unassigned", createdAt: "2025-07-01", updatedAt: "2025-07-01", lastSeenAt: "2025-07-01", duplicateKey: "pacific-tax-australia-melbourne" },
  { id: "LD009", companyName: "Grand Palace Resort", contactName: "Ahmed Al-Rashid", product: "Haigo", industry: "Hospitality", market: "GCC", country: "UAE", city: "Abu Dhabi", source: "Google Maps", sourceUrl: "https://google.com/maps/grand-palace", leadScore: 88, intentLevel: "Hot Lead", status: "Demo Booked", painPoints: ["revenue management", "front desk", "guest management"], suggestedAngle: "AI-driven revenue management for luxury properties", aiSummary: "200-room resort currently on Oracle OPERA. Looking for modern cloud PMS.", assignedUser: "Mike R.", createdAt: "2025-06-25", updatedAt: "2025-07-04", lastSeenAt: "2025-07-04", duplicateKey: "grand-palace-gcc-abu-dhabi" },
  { id: "LD010", companyName: "FreshBite Cloud Kitchen", contactName: "Nina Patel", product: "Dilivygo", industry: "Cloud Kitchen", market: "GCC", country: "UAE", city: "Dubai", source: "Instagram", sourceUrl: "https://instagram.com/freshbite", leadScore: 38, intentLevel: "Low Intent", status: "New", painPoints: [], suggestedAngle: "Simplify your cloud kitchen operations", aiSummary: "Cloud kitchen Instagram account. Low intent - no direct pain signals found.", assignedUser: "Unassigned", createdAt: "2025-07-02", updatedAt: "2025-07-02", lastSeenAt: "2025-07-02", duplicateKey: "freshbite-gcc-dubai" },
  { id: "LD011", companyName: "Skyline Properties", contactName: "James O'Brien", product: "Marlin", industry: "Real Estate", market: "USA", country: "USA", city: "Chicago", source: "LinkedIn", sourceUrl: "https://linkedin.com/company/skyline-properties", leadScore: 82, intentLevel: "Hot Lead", status: "Qualified", painPoints: ["lease management", "rent collection", "maintenance requests"], suggestedAngle: "End-to-end property management automation", aiSummary: "500+ unit property management company. Currently on AppFolio, exploring alternatives.", assignedUser: "Sarah M.", createdAt: "2025-06-28", updatedAt: "2025-07-03", lastSeenAt: "2025-07-03", duplicateKey: "skyline-properties-usa-chicago" },
  { id: "LD012", companyName: "Numbers Plus CPA", contactName: "Rachel Green", product: "Terro", industry: "Accounting", market: "USA", country: "USA", city: "Austin", source: "Referral", sourceUrl: "referral-from-green-ledger", leadScore: 90, intentLevel: "Hot Lead", status: "Contacted", painPoints: ["QuickBooks limitations", "invoice automation", "tax compliance"], suggestedAngle: "Upgrade from QuickBooks to enterprise-grade accounting", aiSummary: "CPA firm outgrowing QuickBooks. Needs multi-client automation. High conversion potential.", assignedUser: "Alex J.", createdAt: "2025-07-04", updatedAt: "2025-07-04", lastSeenAt: "2025-07-04", duplicateKey: "numbers-plus-usa-austin" },
  { id: "LD013", companyName: "The Coastal Inn", contactName: "Tom Hardy", product: "Haigo", industry: "Hotel", market: "UK", country: "UK", city: "Brighton", source: "YouTube", sourceUrl: "https://youtube.com/watch?v=xyz789", leadScore: 60, intentLevel: "Pain Signal", status: "Needs Review", painPoints: ["OTA commissions"], suggestedAngle: "Reduce OTA dependency with direct bookings", aiSummary: "Small hotel commenting on YouTube about OTA commission frustrations. Needs verification.", assignedUser: "Unassigned", createdAt: "2025-07-01", updatedAt: "2025-07-02", lastSeenAt: "2025-07-02", duplicateKey: "coastal-inn-uk-brighton" },
  { id: "LD014", companyName: "Golden Dragon Restaurant", contactName: "Wei Zhang", product: "Dilivygo", industry: "Restaurant", market: "Australia", country: "Australia", city: "Melbourne", source: "Facebook", sourceUrl: "https://facebook.com/goldendragonmelb", leadScore: 71, intentLevel: "Warm Lead", status: "Contacted", painPoints: ["food cost", "POS integration"], suggestedAngle: "Integrated POS with smart food cost tracking", aiSummary: "Chinese restaurant using Square POS. Interested in better food cost analytics.", assignedUser: "Mike R.", createdAt: "2025-06-29", updatedAt: "2025-07-02", lastSeenAt: "2025-07-02", duplicateKey: "golden-dragon-australia-melbourne" },
  { id: "LD015", companyName: "Atlas Financial Services", contactName: "Omar Hassan", product: "Terro", industry: "Finance", market: "GCC", country: "Saudi Arabia", city: "Riyadh", source: "Manual", sourceUrl: "manual-import-2025-07-03", leadScore: 25, intentLevel: "Low Intent", status: "Rejected", painPoints: [], suggestedAngle: "", aiSummary: "Manually imported lead. No clear pain signals. Rejected after review.", assignedUser: "Unassigned", createdAt: "2025-07-03", updatedAt: "2025-07-03", lastSeenAt: "2025-07-03", duplicateKey: "atlas-financial-gcc-riyadh" },
];

export const mockCompanies: Company[] = [
  { id: "CO001", name: "Spice Route Kitchen", website: "https://spiceroute.com", industry: "Restaurant", productFit: "Dilivygo", country: "USA", city: "New York", phone: "+1 212-555-0101", email: "info@spiceroute.com", linkedInUrl: "https://linkedin.com/company/spice-route", employeeCount: 45, leadCount: 2, description: "Family-owned restaurant chain specializing in Indian fusion cuisine.", createdAt: "2025-07-01" },
  { id: "CO002", name: "Urban Plates", website: "https://urbanplates.co.uk", industry: "Cloud Kitchen", productFit: "Dilivygo", country: "UK", city: "London", phone: "+44 20-7946-0958", email: "hello@urbanplates.co.uk", linkedInUrl: "https://linkedin.com/company/urban-plates", employeeCount: 120, leadCount: 1, description: "Cloud kitchen group operating 12 locations across London.", createdAt: "2025-06-28" },
  { id: "CO003", name: "Horizon Realty Group", website: "https://horizonrealty.com", industry: "Real Estate", productFit: "Marlin", country: "USA", city: "Miami", phone: "+1 305-555-0202", email: "contact@horizonrealty.com", linkedInUrl: "https://linkedin.com/company/horizon-realty", employeeCount: 35, leadCount: 1, description: "Property management firm overseeing 200+ residential units in Miami.", createdAt: "2025-06-25" },
  { id: "CO004", name: "Green Ledger Accounting", website: "https://greenledger.ae", industry: "Accounting", productFit: "Terro", country: "UAE", city: "Dubai", phone: "+971 4-555-0303", email: "team@greenledger.ae", linkedInUrl: "https://linkedin.com/company/green-ledger", employeeCount: 20, leadCount: 1, description: "Accounting firm specializing in UAE tax compliance and e-invoicing.", createdAt: "2025-07-02" },
  { id: "CO005", name: "Grand Palace Resort", website: "https://grandpalaceresort.ae", industry: "Hospitality", productFit: "Haigo", country: "UAE", city: "Abu Dhabi", phone: "+971 2-555-0404", email: "reservations@grandpalace.ae", linkedInUrl: "https://linkedin.com/company/grand-palace", employeeCount: 200, leadCount: 1, description: "200-room luxury resort in Abu Dhabi with conference facilities.", createdAt: "2025-06-20" },
  { id: "CO006", name: "Numbers Plus CPA", website: "https://numbersplus.com", industry: "Accounting", productFit: "Terro", country: "USA", city: "Austin", phone: "+1 512-555-0505", email: "info@numbersplus.com", linkedInUrl: "https://linkedin.com/company/numbers-plus", employeeCount: 15, leadCount: 1, description: "CPA firm serving small to mid-size businesses across Texas.", createdAt: "2025-07-04" },
];

export const mockContacts: Contact[] = [
  { id: "CT001", companyId: "CO001", companyName: "Spice Route Kitchen", fullName: "Rahul Mehta", jobTitle: "Owner & Founder", email: "rahul@spiceroute.com", phone: "+1 212-555-0101", linkedInUrl: "https://linkedin.com/in/rahulmehta", country: "USA", source: "Reddit", status: "Active", createdAt: "2025-07-03" },
  { id: "CT002", companyId: "CO002", companyName: "Urban Plates", fullName: "Sarah Chen", jobTitle: "Operations Director", email: "sarah@urbanplates.co.uk", phone: "+44 20-7946-0958", linkedInUrl: "https://linkedin.com/in/sarahchen", country: "UK", source: "LinkedIn", status: "Active", createdAt: "2025-07-02" },
  { id: "CT003", companyId: "CO003", companyName: "Horizon Realty Group", fullName: "Mike Torres", jobTitle: "Property Manager", email: "mike@horizonrealty.com", phone: "+1 305-555-0202", linkedInUrl: "https://linkedin.com/in/miketorres", country: "USA", source: "Google Maps", status: "Active", createdAt: "2025-07-01" },
  { id: "CT004", companyId: "CO004", companyName: "Green Ledger Accounting", fullName: "Priya Sharma", jobTitle: "CFO", email: "priya@greenledger.ae", phone: "+971 4-555-0303", linkedInUrl: "https://linkedin.com/in/priyasharma", country: "UAE", source: "LinkedIn", status: "Active", createdAt: "2025-07-03" },
  { id: "CT005", companyId: "CO005", companyName: "Grand Palace Resort", fullName: "Ahmed Al-Rashid", jobTitle: "General Manager", email: "ahmed@grandpalace.ae", phone: "+971 2-555-0404", linkedInUrl: "https://linkedin.com/in/ahmedalrashid", country: "UAE", source: "Google Maps", status: "Active", createdAt: "2025-06-25" },
  { id: "CT006", companyId: "CO006", companyName: "Numbers Plus CPA", fullName: "Rachel Green", jobTitle: "Managing Partner", email: "rachel@numbersplus.com", phone: "+1 512-555-0505", linkedInUrl: "https://linkedin.com/in/rachelgreen", country: "USA", source: "Referral", status: "Active", createdAt: "2025-07-04" },
];

export const mockScraperRuns: ScraperRun[] = [
  { id: "SR001", source: "Reddit", startedAt: "2025-07-04T08:00:00Z", completedAt: "2025-07-04T08:12:34Z", duration: "12m 34s", leadsFound: 23, leadsAdded: 18, duplicatesSkipped: 3, errors: 2, status: "Completed", errorMessage: null },
  { id: "SR002", source: "LinkedIn", startedAt: "2025-07-04T09:00:00Z", completedAt: "2025-07-04T09:25:11Z", duration: "25m 11s", leadsFound: 45, leadsAdded: 32, duplicatesSkipped: 8, errors: 5, status: "Completed", errorMessage: null },
  { id: "SR003", source: "Google Maps", startedAt: "2025-07-04T10:00:00Z", completedAt: null, duration: "--", leadsFound: 12, leadsAdded: 12, duplicatesSkipped: 0, errors: 0, status: "Running", errorMessage: null },
  { id: "SR004", source: "YouTube", startedAt: "2025-07-03T22:00:00Z", completedAt: "2025-07-03T22:08:45Z", duration: "8m 45s", leadsFound: 8, leadsAdded: 5, duplicatesSkipped: 2, errors: 1, status: "Completed", errorMessage: null },
  { id: "SR005", source: "X / Twitter", startedAt: "2025-07-03T20:00:00Z", completedAt: "2025-07-03T20:05:22Z", duration: "5m 22s", leadsFound: 15, leadsAdded: 11, duplicatesSkipped: 3, errors: 1, status: "Failed", errorMessage: "Rate limit exceeded on Twitter API" },
];

export const mockSources: SourceHealth[] = [
  { name: "Reddit", status: "Active", leadsFound: 420, hotLeads: 38, lastRun: "2025-07-04 08:12", lastSuccess: "2025-07-04 08:12", errorCount: 3, successRate: 96.5, avgScore: 68 },
  { name: "LinkedIn", status: "Active", leadsFound: 350, hotLeads: 52, lastRun: "2025-07-04 09:25", lastSuccess: "2025-07-04 09:25", errorCount: 8, successRate: 93.2, avgScore: 74 },
  { name: "Google Maps", status: "Active", leadsFound: 280, hotLeads: 22, lastRun: "2025-07-04 10:00", lastSuccess: "2025-07-03 22:00", errorCount: 1, successRate: 98.0, avgScore: 62 },
  { name: "YouTube", status: "Active", leadsFound: 190, hotLeads: 15, lastRun: "2025-07-03 22:08", lastSuccess: "2025-07-03 22:08", errorCount: 2, successRate: 97.0, avgScore: 55 },
  { name: "X / Twitter", status: "Error", leadsFound: 120, hotLeads: 8, lastRun: "2025-07-03 20:05", lastSuccess: "2025-07-02 18:00", errorCount: 12, successRate: 82.0, avgScore: 48 },
  { name: "Facebook", status: "Active", leadsFound: 95, hotLeads: 7, lastRun: "2025-07-03 14:00", lastSuccess: "2025-07-03 14:00", errorCount: 0, successRate: 100, avgScore: 52 },
  { name: "Instagram", status: "Paused", leadsFound: 60, hotLeads: 3, lastRun: "2025-07-01 10:00", lastSuccess: "2025-07-01 10:00", errorCount: 0, successRate: 100, avgScore: 44 },
  { name: "Directory", status: "Active", leadsFound: 85, hotLeads: 5, lastRun: "2025-07-03 16:00", lastSuccess: "2025-07-03 16:00", errorCount: 0, successRate: 100, avgScore: 58 },
  { name: "Manual", status: "Active", leadsFound: 42, hotLeads: 6, lastRun: "2025-07-04 07:00", lastSuccess: "2025-07-04 07:00", errorCount: 0, successRate: 100, avgScore: 71 },
  { name: "Referral", status: "Active", leadsFound: 28, hotLeads: 8, lastRun: "2025-07-04 11:00", lastSuccess: "2025-07-04 11:00", errorCount: 0, successRate: 100, avgScore: 82 },
];

export const monthlyLeadData = [
  { month: "Jan", leads: 120, hot: 18, converted: 8 },
  { month: "Feb", leads: 145, hot: 22, converted: 12 },
  { month: "Mar", leads: 180, hot: 30, converted: 15 },
  { month: "Apr", leads: 165, hot: 25, converted: 11 },
  { month: "May", leads: 210, hot: 38, converted: 20 },
  { month: "Jun", leads: 245, hot: 42, converted: 24 },
  { month: "Jul", leads: 198, hot: 35, converted: 18 },
];

export const leadsByProduct = [
  { product: "Dilivygo", count: 485, hot: 62 },
  { product: "Marlin", count: 312, hot: 38 },
  { product: "Terro", count: 278, hot: 45 },
  { product: "Haigo", count: 215, hot: 28 },
  { product: "Review", count: 162, hot: 12 },
];

export const leadsBySource = [
  { source: "Reddit", count: 420 },
  { source: "LinkedIn", count: 350 },
  { source: "Google Maps", count: 280 },
  { source: "YouTube", count: 190 },
  { source: "X / Twitter", count: 120 },
  { source: "Facebook", count: 95 },
  { source: "Directory", count: 85 },
  { source: "Instagram", count: 60 },
  { source: "Manual", count: 42 },
  { source: "Referral", count: 28 },
];

export const leadsByMarket = [
  { market: "USA", count: 520, hot: 68 },
  { market: "UK", count: 280, hot: 35 },
  { market: "Australia", count: 210, hot: 22 },
  { market: "GCC", count: 340, hot: 52 },
  { market: "Other", count: 102, hot: 8 },
];

export const painPointData = [
  { pain: "Delivery tablets", count: 85 },
  { pain: "Missed phone orders", count: 72 },
  { pain: "Manual reconciliation", count: 65 },
  { pain: "OTA commissions", count: 58 },
  { pain: "Food cost tracking", count: 52 },
  { pain: "Rent collection", count: 45 },
  { pain: "Guest management", count: 42 },
  { pain: "Tax compliance", count: 38 },
];
