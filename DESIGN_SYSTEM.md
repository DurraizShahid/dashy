# Dashy CRM — Design System Document

> This document captures the full design system of the Dashy (HelpTribe CRM) application.  
> All AI agents MUST follow these rules when creating or modifying pages.  
> **Do not deviate** from the tokens, layout patterns, component behaviors, or visual conventions documented here.

---

## 1. Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16 (App Router) | Uses `"use client"` on all page-level components |
| Styling | Tailwind CSS v4 + CSS Variables | No runtime CSS-in-JS |
| UI Library | shadcn/ui (base-nova style) + Base UI React | Components in `@/components/ui` |
| Icons | Lucide React v1.23 | Tree-shakeable |
| Fonts | Inter (body) + Poppins (headings) | Loaded via `next/font/google` in layout.tsx |
| Charts | Recharts v3 | Used in dashboard |
| Theme | next-themes | class-based dark mode toggle |
| Utils | `cn()` from `@/lib/utils` (clsx + tailwind-merge) | Required for all class merges |

---

## 2. Design Tokens

### 2.1 Color System (Light Mode — `:root`)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#C4CBDE` | Page background (a muted blue-gray) |
| `--foreground` | `#28243D` | Primary text color (deep violet-black) |
| `--card` | `#FFFFFF` | Card/surface backgrounds |
| `--card-foreground` | `#28243D` | Text on cards |
| `--primary` | `#7060B8` | Primary purple — buttons, active states, links |
| `--primary-foreground` | `#FFFFFF` | Text on primary backgrounds |
| `--secondary` | `#EEEAF6` | Light purple-gray — secondary buttons, muted tabs |
| `--secondary-foreground` | `#4D4764` | Text on secondary surfaces |
| `--muted` | `#F0EDF6` | Table header rows, filter backgrounds |
| `--muted-foreground` | `#7B7592` | Secondary text, timestamps, descriptions |
| `--accent` | `#F06890` | Pink accent — hot lead badges, decorative elements |
| `--accent-foreground` | `#FFFFFF` | Text on accent backgrounds |
| `--destructive` | `#E85888` | Destructive buttons, error indicators |
| `--border` | `#E9E7F0` | Borders, table row separators, inputs |
| `--input` | `#E9E7F0` | Input borders |
| `--ring` | `#7060B8` | Focus ring color |
| `--radius` | `1rem` | Base radius — all other radii derive from this |

### 2.2 Derived Radii

```css
--radius-sm: calc(var(--radius) * 0.6);   /* ~9.6px */
--radius-md: calc(var(--radius) * 0.8);   /* ~12.8px */
--radius-lg: var(--radius);               /* 16px */
--radius-xl: calc(var(--radius) * 1.4);   /* ~22.4px */
--radius-2xl: calc(var(--radius) * 1.8);  /* ~28.8px */
--radius-3xl: calc(var(--radius) * 2.2);  /* ~35.2px */
--radius-4xl: calc(var(--radius) * 2.6);  /* ~41.6px */
```

**Fixed shortcut classes used in code:**
- `rounded-[36px]` — the outer card container
- `rounded-[24px]` — large hero cards
- `rounded-[20px]` — stat cards and card sections
- `rounded-[16px]` — inline info panels
- `rounded-[12px]` — inputs and selects
- `rounded-[26px]` — sidebar container

### 2.3 Color System (Dark Mode — `.dark`)

| Token | Light | Dark |
|-------|-------|------|
| `--background` | `#C4CBDE` | `#13131f` |
| `--foreground` | `#28243D` | `#e0dce8` |
| `--card` | `#FFFFFF` | `#1c1c2e` |
| `--primary` | `#7060B8` | `#9080d0` |
| `--secondary` | `#EEEAF6` | `#2a2a40` |
| `--muted` | `#F0EDF6` | `#26263a` |
| `--border` | `#E9E7F0` | `#30304a` |
| `--sidebar` | `#504098` | `#2d1f5e` |

### 2.4 CRM Custom Tokens

| Token | Light | Usage |
|-------|-------|-------|
| `--crm-bg` | `#C4CBDE` | Same as background |
| `--crm-surface` | `#F7F7F8` | Market snapshot panel bg |
| `--crm-purple` | `#7060B8` | Primary purple |
| `--crm-purple-dark` | `#504098` | Sidebar base gradient end |
| `--crm-pink` | `#F06890` | Accent pink |
| `--crm-pink-light` | `#F890B0` | Lighter pink variant |
| `--crm-text` | `#28243D` | Same as foreground |
| `--crm-text-secondary` | `#4D4764` | Same as secondary-foreground |
| `--crm-text-muted` | `#7B7592` | Same as muted-foreground |
| `--crm-border` | `#E9E7F0` | Same as border |

### 2.5 Shadow Tokens

| Token | Light | Dark |
|-------|-------|------|
| `--shadow-card` | `0 1px 8px rgba(80,64,152,0.06), 0 0 1px rgba(80,64,152,0.1)` | `0 1px 8px rgba(0,0,0,0.3), 0 0 1px rgba(0,0,0,0.5)` |
| `--shadow-soft` | `0 2px 16px rgba(80,64,152,0.08)` | `0 2px 16px rgba(0,0,0,0.25)` |
| `--shadow-elevated` | `0 4px 24px rgba(80,64,152,0.12)` | `0 4px 24px rgba(0,0,0,0.35)` |

Utility classes: `shadow-card`, `shadow-soft`, `shadow-elevated` — use these instead of inline shadow values.

### 2.6 Typography

| Font | Variable | Weights | Usage |
|------|----------|---------|-------|
| Inter | `--font-inter` | 400, 500, 600, 700 | Body text, table content, labels |
| Poppins | `--font-poppins` | 500, 600, 700 | Headings, stat numbers |

**CSS class mapping:**
- `font-sans` → Inter (default body)
- `font-heading` → Poppins (via `font-heading` in theme)
- `font-poppins` → utility class for explicit Poppins usage

**Size scale used in practice:**
- Page titles: `text-lg font-semibold font-poppins` (CRMTopbar h1)
- Section headings: `text-sm font-semibold font-poppins`
- Big stats: `text-2xl font-semibold font-poppins`
- Hero numbers: `text-3xl font-bold` or `text-4xl font-bold font-poppins`
- Body: `text-sm text-foreground`
- Muted body: `text-sm text-muted-foreground`
- Captions/timestamps: `text-xs text-muted-foreground`
- Table headers: `text-xs uppercase text-muted-foreground font-medium`

### 2.7 Spacing

- Page shell: `py-4 px-4` → `p-5` on inner card → `gap-5` between sidebar + content
- Topbar: `px-6 py-3`
- Content sections: `px-6` (horizontal padding from the content area edges)
- Card internal: `p-5` or `p-4` or `p-6`
- Table cells: `px-4 py-3`
- Filter/stats pills: `px-4 py-1.5` or `px-3 py-1`
- Gap between elements in a row: `gap-4` or `gap-3`

---

## 3. Layout Architecture

### 3.1 Page Shell (Every Page)

Every page follows this exact structure:

```tsx
<div className="bg-background h-screen overflow-hidden">
  <div className="h-full py-4 px-4">
    <div className="h-full bg-card rounded-[36px] p-5 shadow-elevated">
      <div className="flex gap-5 h-full">
        <CRMSidebar activeItem="..." />
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0 pr-1">
          <CRMTopbar title="..." subtitle="..." />
          {/* PAGE CONTENT HERE */}
        </div>
      </div>
    </div>
  </div>
</div>
```

**Key rules:**
- The outer container is always `bg-background h-screen overflow-hidden` (full viewport, no body scroll)
- The inner white card container is always `bg-card rounded-[36px] p-5 shadow-elevated`
- Sidebar + content are always in a `flex gap-5 h-full`
- The content area is always `flex-1 flex flex-col gap-4 overflow-y-auto min-w-0 pr-1`
- **Every page** uses `"use client"` at the top

### 3.2 Sidebar (`CRMSidebar`)

- Located at `@/components/crm/crm-sidebar`
- Takes an `activeItem` prop (lowercase string matching nav label)
- Width: `w-[68px]` collapsed, `w-[200px]` expanded (user toggles via chevron button)
- Background: `bg-gradient-to-b from-[#7060B8] to-[#504098]`
- Border radius: `rounded-[26px]`
- Active nav item: `bg-white/15`, hover: `hover:bg-white/10`
- Text: white throughout
- Logo area: `rounded-xl bg-white/15`: shows "HT" collapsed, "HelpTribe" expanded
- Bottom: Settings link, expand/collapse toggle button (`rounded-full bg-white/15`), user avatar (`rounded-full bg-white/20`)

### 3.3 Topbar (`CRMTopbar`)

- Located at `@/components/crm/crm-topbar`
- Props: `title: string`, `subtitle?: string`
- Layout: `flex items-center justify-between px-6 py-3`
- Left: breadcrumb "HelpTribe CRM" → page title (font-poppins) → optional subtitle
- Right: Search input, theme toggle, user avatar

### 3.4 Stats Pill Row

Used on leads page, contacts page, scraper-runs page:
```tsx
<div className="flex flex-wrap gap-3 px-6 mb-4">
  <span className="rounded-full bg-[#F0EDF6] text-[#7060B8] px-4 py-1.5 text-xs font-medium">
    Label: Count
  </span>
</div>
```

Standard pill color pairs:
- Purple: `bg-[#F0EDF6] text-[#7060B8]`
- Blue: `bg-[#E3F2FD] text-[#1565C0]`
- Green: `bg-[#E8F5E9] text-[#2E7D32]`
- Dark Green: `bg-[#E8F5E9] text-[#1B5E20]`
- Orange: `bg-[#FFF3E0] text-[#E65100]`
- Pink/Red: `bg-[#FCE4EC] text-[#E85888]`

---

## 4. Component Patterns

### 4.1 Cards

**Stat/Chart Cards:**
```tsx
<div className="bg-card rounded-[20px] p-5 shadow-card">
  <h3 className="font-poppins font-semibold text-foreground mb-4">Title</h3>
  {/* content */}
</div>
```

**Smaller stat cards (4-column grid):**
```tsx
<div className="bg-card rounded-[20px] p-4 shadow-card">
```

**Hero gradient cards:**
- Purple gradient: `rounded-[24px] p-6 gradient-purple` (leads overview)
- Pink gradient: `rounded-[24px] p-6 gradient-pink` (hot lead activity)
- Combined: `rounded-[20px] p-5 bg-gradient-to-r from-[#F06890] to-[#7060B8]` (hot leads header)
- Purple to dark: `rounded-[20px] p-5 bg-gradient-to-r from-[#7060B8] to-[#504098]` (review queue header)

### 4.2 Tables

Tables are consistently built with native `<table>` elements (not shadcn Table component), styled directly:

```tsx
<div className="bg-card rounded-[20px] shadow-card overflow-hidden mx-6 mb-6">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-muted">
          <th className="text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left">Column</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id} className="border-b border-border hover:bg-muted transition-colors">
            <td className="px-4 py-3">...</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

**Table conventions:**
- Thead cells: `text-xs uppercase text-muted-foreground font-medium px-4 py-3 text-left`
- Tbody cells: `px-4 py-3` with `text-sm text-foreground` or `text-sm text-muted-foreground` for secondary data
- Row hover: `hover:bg-muted transition-colors`
- Row separator: `border-b border-border`

### 4.3 Buttons

**Primary button** (purple CTA):
```tsx
<button className="flex items-center gap-2 bg-[#7060B8] text-white rounded-[12px] px-4 py-2 text-sm font-medium">
  <Plus className="size-4" />
  Add Lead
</button>
```

**Secondary/outline button** (inline actions):
```tsx
<button className="flex items-center gap-1.5 rounded-lg bg-muted border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
  <Pause className="size-3" />
  Pause
</button>
```

**Pill toggle buttons** (tab-style):
```tsx
<button className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
  active ? "bg-[#7060B8] text-white" : "bg-[#EEEAF6] text-[#504098] hover:bg-muted"
}`}>
  Hot
</button>
```

**Inline action buttons** (in tables):
```tsx
<button className="bg-[#2E7D32] text-white text-xs rounded-lg px-3 py-1 hover:bg-[#1B5E20] transition-colors">Approve</button>
<button className="bg-[#7060B8] text-white text-xs rounded-lg px-3 py-1 hover:bg-[#504098] transition-colors">Merge</button>
<button className="bg-[#E9E7F0] text-secondary-foreground text-xs rounded-lg px-3 py-1 hover:bg-[#DED8EB] transition-colors">Keep Separate</button>
<button className="text-[#7060B8] text-xs font-medium hover:underline">View Logs</button>
```

### 4.4 Inputs & Selects

**Text input:**
```tsx
<input
  type="text"
  placeholder="Search leads..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="w-full rounded-[12px] bg-muted border border-border pl-9 pr-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
/>
```

**Search input with icon:**
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
  <input type="text" placeholder="Search leads..." className="..." />
</div>
```

**Topbar search:**
```tsx
<input
  type="text"
  placeholder="Search leads..."
  className="h-8 w-56 rounded-lg border border-input bg-transparent pl-8 pr-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
/>
```

**Select dropdown:**
```tsx
<select value={filter} onChange={...} className="rounded-[12px] bg-muted border border-border px-3 py-2 text-sm text-foreground outline-none">
  <option value="All">All Items</option>
</select>
```

### 4.5 Badges

Located at `@/components/crm/badges.tsx`. There are 5 badge types:

**IntentBadge** — `ScoreBadge`-style colored pills:
- Hot Lead: `bg-gradient-to-r from-[#F06890] to-[#E85888] text-white`
- Warm Lead: `bg-[#FFF3E0] text-[#E65100]`
- Pain Signal: `bg-[#EDE7F6] text-[#504098]`
- Low Intent: `bg-[#F5F5F5] text-[#7B7592]`
- Unclear: `bg-[#E9E7F0] text-[#7B7592]`

**StatusBadge** — status-based color mapping:
- New: `bg-[#E3F2FD] text-[#1565C0]`
- Needs Review: `bg-[#EDE7F6] text-[#7060B8]`
- Qualified: `bg-[#E8F5E9] text-[#2E7D32]`
- Contacted: `bg-[#FFF8E1] text-[#F57F17]`
- Follow-up Scheduled: `bg-[#E0F7FA] text-[#00838F]`
- Demo Booked: `bg-[#F3E5F5] text-[#7060B8]`
- Won: `bg-[#E8F5E9] text-[#1B5E20]`
- Lost: `bg-[#FFEBEE] text-[#C62828]`
- Rejected: `bg-[#F5F5F5] text-[#757575]`
- Duplicate: `bg-[#FFF3E0] text-[#E65100]`

**ProductBadge** — product-specific colors:
- Dilivygo: `bg-[#E8F5E9] text-[#2E7D32]` (green)
- Marlin: `bg-[#E3F2FD] text-[#1565C0]` (blue)
- Terro: `bg-[#FFF3E0] text-[#E65100]` (orange)
- Haigo: `bg-[#F3E5F5] text-[#7060B8]` (purple)
- Review: `bg-[#F5F5F5] text-[#7B7592]` (gray)

**SourceBadge** — uniform style: `bg-[#EEEAF6] text-[#504098]`

**ScoreBadge** — numeric badge with thresholds:
- Score >= 80: `bg-gradient-to-r from-[#F06890] to-[#E85888] text-white`
- Score >= 60: `bg-[#FFF3E0] text-[#E65100]`
- Score >= 40: `bg-[#EDE7F6] text-[#504098]`
- Score < 40: `bg-[#F5F5F5] text-[#7B7592]`

All badges share: `rounded-full px-3 py-1 text-xs font-medium inline-flex items-center`
ScoreBadge additionally has `min-w-[40px] justify-center`

### 4.6 Avatars

User/contact avatar pattern:
```tsx
<div className="w-8 h-8 rounded-full bg-[#EEEAF6] text-[#504098] text-xs flex items-center justify-center font-medium">
  AJ
</div>
```
- Size: `w-8 h-8` (32px), `w-10 h-10` (40px) for larger variants
- Background: `bg-[#EEEAF6]`
- Text: `text-[#504098] text-xs font-medium` or `text-xs font-semibold text-white` (sidebar variant uses `bg-white/20`)

### 4.7 Toggle Switch

```tsx
<div className={`relative rounded-full w-10 h-5 ${on ? "bg-[#7060B8]" : "bg-[#E9E7F0]"}`}>
  <div className={`absolute top-0.5 size-4 rounded-full bg-card transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
</div>
```

### 4.8 Progress Bar

```tsx
<div className="bg-[#E9E7F0] rounded-full h-1.5 mt-3">
  <div className="h-1.5 rounded-full" style={{ width: `${percentage}%`, backgroundColor: card.barColor }} />
</div>
```

### 4.9 Status Dot Indicator (Scraper Runs)

```tsx
{status === "Running" && (
  <span className="relative flex size-2">
    <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#1565C0] opacity-75" />
    <span className="relative inline-flex size-2 rounded-full bg-[#1565C0]" />
  </span>
)}
{status === "Completed" && <span className="size-2 rounded-full bg-[#2E7D32]" />}
{status === "Failed" && <span className="size-2 rounded-full bg-[#C62828]" />}
```

---

## 5. Page Patterns (Templates)

### 5.1 Table Page (Leads, Contacts, Companies, Scraper Runs, Duplicates)

Structure:
1. Shell wrapper → Sidebar → Content area → Topbar
2. Stat pills row (optional)
3. Filter bar (optional) — inline search + selects + action button
4. Table with standard header and rows

### 5.2 Settings/Config Page (Settings, Notifications)

Structure:
1. Shell wrapper → Sidebar → Content area → Topbar
2. Vertical stack of config sections, each as a `rounded-[20px] p-5 shadow-card` card
3. Each section has a `font-poppins font-semibold text-sm text-foreground mb-4` heading
4. Rows inside use `border-b border-border` dividers
5. Left-aligned label, right-aligned value/action pattern

### 5.3 Card Grid Page (Reports, Sources)

Structure:
1. Shell wrapper → Sidebar → Content area → Topbar
2. Stat pills row (optional)
3. Grid of cards: `grid grid-cols-3 gap-4 px-6 mb-6`
4. Each card: `rounded-[20px] p-5 shadow-card`

### 5.4 Dashboard Page

The most complex page. Sections are stacked vertically:
1. Topbar
2. Hero cards row (2 cards — large purple + smaller pink)
3. 4-column stat cards grid
4. Two-panel row (chart left + priority list right)

---

## 6. Gradient Classes (in globals.css)

```css
.gradient-purple {
  background: linear-gradient(135deg, #7060B8 0%, #6050A0 50%, #504098 100%);
}
.gradient-pink {
  background: linear-gradient(135deg, #F880A8 0%, #F06890 55%, #E85888 100%);
}
.gradient-purple-soft {
  background: linear-gradient(135deg, rgba(112,96,184,0.08) 0%, rgba(80,64,152,0.04) 100%);
}
.gradient-pink-soft {
  background: linear-gradient(135deg, rgba(240,104,144,0.08) 0%, rgba(232,88,136,0.04) 100%);
}
```

Also available: `.glass-panel` (frosted glass with backdrop-blur).

---

## 7. Animation & Transitions

- Sidebar width: `transition-all duration-300`
- Toggle switch: `transition-transform`
- Row hover: `transition-colors`
- Button hover/active: `transition-colors` + `active:translate-y-px` (shadcn button)
- Ping animation for running status: `animate-ping`
- Theme toggle: no animation (CSS variable swap)

**No entry/exit animations, no page transitions, no loading skeleton patterns exist yet.** Keep consistent — add animations only with explicit approval.

---

## 8. Dark Mode

- Uses `next-themes` with `attribute="class"`
- Default: `system`, with `enableSystem`
- All theme-aware colors use CSS variables that change under `.dark`
- Manually toggleable via the Sun/Moon button in topbar (mounted state pattern to avoid hydration mismatch)
- Dark mode values are defined in `.dark` block in `globals.css`
- Sidebar is always its own color (not CSS var, explicit `#504098` / `#2d1f5e`)

---

## 9. Data Visualization (Charts)

Using Recharts. Dashboard chart pattern:
```tsx
<ResponsiveContainer width="100%" height={220}>
  <BarChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
    <XAxis dataKey="key" tick={{ fontSize: 11, fill: "#7B7592" }} axisLine={false} tickLine={false} />
    <YAxis tick={{ fontSize: 11, fill: "#7B7592" }} axisLine={false} tickLine={false} />
    <Tooltip cursor={false} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(80,64,152,0.12)", fontSize: 12 }} />
    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={28}>
      {data.map((_, i) => <Cell key={i} fill="#7060B8" />)}
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

Chart conventions:
- Numbered labels: `fontSize: 11, fill: "#7B7592"` (same as muted-foreground)
- No axis lines, no tick lines
- Bar radius: `[6, 6, 0, 0]`
- Bar size: 28px
- Tooltip: white card with elevated shadow
- Single color bar fills (`#7060B8`)

---

## 10. Path Aliases & Imports

```typescript
import { cn } from "@/lib/utils"
import { CRMSidebar } from "@/components/crm/crm-sidebar"
import { CRMTopbar } from "@/components/crm/crm-topbar"
import { IntentBadge, StatusBadge, ProductBadge, SourceBadge, ScoreBadge } from "@/components/crm/badges"
import { mockLeads, mockCompanies, mockContacts, mockScraperRuns, mockSources } from "@/data/mock"
import type { Lead, Company, Contact, ScraperRun, SourceHealth, Product, Market, Source, IntentLevel, LeadStatus } from "@/data/types"
import { LayoutDashboard, Users, Search, Plus, MoreHorizontal, ... } from "lucide-react"
```

---

## 11. Design Rules for AI Agents

### DO:
- Always use the page shell structure (Section 3.1) for every new page
- Use `cn()` for all class merges
- Use CSS variable colors (`bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`) — never hardcode colors except for palette-specific UI (product colors, status colors)
- Use the badge components from `@/components/crm/badges` for status/intent/product/source/score
- Use `rounded-[20px] p-5 shadow-card` for standalone cards
- Put all page content inside a scrollable `overflow-y-auto` content div
- Use the pill stat bar pattern with the standard color pairs
- Follow the existing table pattern for list views

### DON'T:
- Don't create new CSS files per page — use globals.css + Tailwind utilities
- Don't introduce new component libraries or icon sets
- Don't change layout.tsx or globals.css without explicit approval
- Don't add new variants to the sidebar or topbar — they are fixed components
- Don't use `@ts-ignore`, `as any`, or delete failing tests
- Don't add page transitions, animations, or loading skeletons — they don't exist yet in this design

### When creating a new page:
1. Check how closely it matches one of the existing page patterns (Section 5)
2. Reuse the matching pattern structure exactly
3. Use the correct badge types for your data
4. Keep font-sizes and spacing aligned with the tokens above
5. Test in both light and dark mode
6. Verify diagnostics and build are clean

### When adding new colors:
- If the color is *semantic* (e.g., a product badge), use hardcoded hex with the established pattern
- If the color is *thematic* (backgrounds, text, borders), extend the CSS variable system in globals.css

---

## 12. File Organization

```
src/
├── app/
│   ├── layout.tsx            — Root layout (fonts, providers)
│   ├── page.tsx              — Redirect to /dashboard
│   ├── globals.css           — ALL CSS variables, theme, utilities
│   ├── dashboard/page.tsx
│   ├── leads/
│   │   ├── page.tsx
│   │   ├── hot/page.tsx
│   │   ├── review/page.tsx
│   │   └── duplicates/page.tsx
│   ├── contacts/page.tsx
│   ├── companies/page.tsx
│   ├── products/page.tsx
│   ├── sources/page.tsx
│   ├── scraper-runs/page.tsx
│   ├── notifications/page.tsx
│   ├── reports/page.tsx
│   └── settings/page.tsx
├── components/
│   ├── providers.tsx         — ThemeProvider wrapper
│   ├── crm/
│   │   ├── crm-sidebar.tsx   — Navigation sidebar
│   │   ├── crm-topbar.tsx    — Page header bar
│   │   └── badges.tsx        — All badge components
│   └── ui/                   — shadcn components (60 files)
├── data/
│   ├── types.ts              — TypeScript interfaces
│   └── mock.ts               — Mock data
├── lib/
│   └── utils.ts              — cn() utility
└── hooks/
    └── use-mobile.ts
```

---

## 13. Key Differences from Default shadcn

This project uses **base-nova style** from shadcn v4, which differs from the classic shadcn style:
- Components use `@base-ui/react` primitives (e.g., `@base-ui/react/button`)
- Styling uses CVA (class-variance-authority) patterns
- CSS variables drive all theme colors
- Tailwind v4 with `@theme inline` block in CSS
- The button component uses `shrink-0`, `bg-clip-padding`, and focus-visible ring patterns
- Card component uses `data-slot` attributes and `@container` queries

**Do not override or replace shadcn UI components.**
**Do not import shadcn components directly in CRM pages** — the existing pages use custom-styled native elements.

---

## 14. Verification Checklist

Before considering any page change complete:
- [ ] Use `cn()` for all class merging
- [ ] No hardcoded colors where CSS variables exist (bg, text, border, etc.)
- [ ] Follows the exact page shell structure from Section 3.1
- [ ] Sidebar activeItem matches the page
- [ ] Content is inside `overflow-y-auto min-w-0 pr-1`
- [ ] Badges use the components from `@/components/crm/badges`
- [ ] Table headers use the `text-xs uppercase text-muted-foreground font-medium` pattern
- [ ] Cards use correct radius/size/shadow pattern
- [ ] Works in both light and dark mode
- [ ] No `as any`, `@ts-ignore`, or `@ts-expect-error`
- [ ] `next build` passes (no type or build errors)
