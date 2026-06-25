# FeedFlow ERP — El-Nujoom Feeds Factory

A fully offline-capable ERP system for poultry & livestock feed factory management, built with React 19 + TypeScript + Vite 7. Runs entirely in the browser after initial load — no internet required for daily operations.

**Default login:**
- Email: `admin@elnujoom.com`
- Password: `admin123`

---

## 1. Technology Stack

| Technology | Usage |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite 7 | Build tool & dev server |
| Tailwind CSS v4 | Styling |
| Framer Motion | Animations & transitions |
| GSAP 3.12.5 | Advanced animations |
| Recharts 2.15 | Charts & graphs |
| Zustand 5 | State management |
| Dexie.js (IndexedDB) | Persistent local storage |
| wouter | Client-side routing |
| Radix UI | Accessible UI primitives |
| Lucide React | Icons |
| sonner | Toast notifications |
| vaul | Drawer component |
| date-fns | Date utilities |
| vite-plugin-pwa | Progressive Web App |
| clsx + tailwind-merge | CSS class utilities |

### Bilingual UI
- Full Arabic (RTL) and English — instant language toggle.
- Every label, table, report, and shortcut is bilingual.
- Egyptian Arabic spellchecker with autocorrect and autocomplete.

---

## 2. User Management & Security

### Sub-Accounts
- 1 master account + unlimited sub-accounts.
- Per-module permissions: **No Access** / **View Only** / **Full Access**.
- Fine-grained feature permissions: create, edit, delete, print, export per module.
- Special permissions: exceed discount limit, access pricing, access HR, access payroll.
- 3 security questions for password recovery.

### Activity Log
- Every event recorded: create, update, delete, login, logout.
- 10,000 event cap with auto-pruning.
- Filter by: module, action type, user, date range (today / 7 days / 30 days / custom).
- Search, JSON export, print, clear all.
- Stored in IndexedDB for persistence.

### Notifications
- Auto-detection: critical inventory, overdue invoices, paused production orders.
- 4 types: **Critical** (red), **Warning** (yellow), **Info** (blue), **Success** (green).
- Notification drawer in header with badge counter, mark-all-read, clear-all.
- Background check every 30 seconds.

### Keyboard Shortcuts
All shortcuts use `e.code` (physical key position) so they work regardless of keyboard language (Arabic/English).

**Navigation (Ctrl+Alt):**

| Shortcut | Module |
|---|---|
| Ctrl+Alt+D | Dashboard |
| Ctrl+Alt+P | Production |
| Ctrl+Alt+S | Sales |
| Ctrl+Alt+I | Inventory |
| Ctrl+Alt+F | Fleet |
| Ctrl+Alt+H | HR |
| Ctrl+Alt+R | Reports |
| Ctrl+Alt+L | Activity Log |
| Ctrl+Alt+G | Profit |
| Ctrl+Alt+T | Settings |
| Ctrl+Alt+C | Customers |
| Ctrl+Alt+O | Procurement |
| Ctrl+Alt+A | Accounting |
| Ctrl+Alt+M | Marketing |
| Ctrl+Alt+K | Sub Accounts |
| Ctrl+Alt+E | Attendance |
| Ctrl+Alt+Y | Payroll |

**Global Actions:**

| Shortcut | Action |
|---|---|
| Ctrl+Shift+G | Global Search |
| Ctrl+Shift+/ | Shortcuts Help |
| Ctrl+Alt+N | New Item |
| Ctrl+Shift+S | Save |
| Ctrl+Shift+P | Print |
| Ctrl+Shift+R | Refresh |
| Ctrl+Shift+E | Export |
| Ctrl+Alt+Delete | Delete |
| Esc | Close |
| ?/؟ (outside input) | Shortcuts Help |

---

## 3. Modules (19 Pages)

### 3.1. Dashboard — `/`
- Animated KPI cards (total sales, production volume, critical inventory, customer count, employee count).
- Weekly sales area chart.
- Inventory distribution bar chart.
- Production order quick stats.
- Fleet vehicle map/status.
- Today's employee attendance.
- Animated number counters, TiltCards, scroll reveals.

### 3.2. Production — `/production`
- **Production Orders**: add, edit, delete. Each order has: product, target tons, produced tons, status (pending / in-progress / paused / completed).
- **Work Sessions**: start/stop timer per order with live counter, cumulative duration calculation.
- **Bagging**: add bags by preset weights (25kg, 50kg, 100kg) or custom weight.
- **Formulas**: define raw material percentages per product (e.g., corn 60%, soy 30%, premix 10%).
- **Cost Calculation**: compute product cost from inventory material prices based on formula.
- **Substitution Engine**: if a material is low, auto-suggest best substitute from inventory.
- **Material Consumption**: auto-deduct raw materials by formula ratio on production.

### 3.3. Inventory — `/inventory`
- **Items**: add, edit, delete (name, quantity, unit = ton/kg/bag, warehouse).
- **Classification**: raw materials / finished products.
- **Warehouses**: manage warehouses with configurable alert thresholds (percentage-based).
- **Alerts**: color-coded (green=normal, yellow=warning, red=critical).
- **Transfer**: move stock between warehouses.
- **Filtering**: all / raw / finished, date range, search.

### 3.4. Sales — `/sales`
- **Invoices**: create sales invoice (cash/credit/wholesale/retail). Add items by tons, select customer, apply discount, 14% VAT.
- **Payment Methods**: cash, bank transfer, Vodafone Cash, InstaPay.
- **Invoice Status**: paid, pending, overdue.
- **Payment Allocation**: auto-allocate payments to oldest unpaid invoices.
- **Returns**: full return management with reason.
- **Customers**: full CRM (name, phone, code, address, governorate, region, credit limit, outstanding debt).
- **Governorates & Regions**: 28 Egyptian governorates with hundreds of built-in regions.
- **Delivery Addresses**: multiple saved addresses per customer.
- **Marketers**: assign sales team members to invoices for commission tracking.

### 3.5. Customers — `/customers`
- Customer listing with search and filters.
- Per-customer stats: total purchases, invoice count, last purchase date, outstanding balance.
- Print customer statement.

### 3.6. Fleet — `/fleet`
- **Vehicles**: manage fleet (name, plate, driver, phone, type = heavy/semi/quarter/light, max capacity, status, location).
- **Shipments**: create multi-stop shipments (multiple invoices to different customers in one trip).
- **Auto Status**: vehicle status updates automatically (loading → on-route → delivered → available).
- **Vehicle Expenses**: add expense (type, amount, date) with auto-deduction from treasury.
- **Expense History**: filterable (all/today/custom), filtered total shown.
- **AI Load Optimization**: suggests optimal trip planning based on capacity and customer proximity.

### 3.7. HR — `/hr`
- **Employees**: full management (name, phone, department, position, salary type = monthly/weekly, base salary, daily incentive, late deduction %, allowances, overtime, deductions, advances, join date).
- **Departments**: create and manage factory departments.
- **Shifts**: define work schedules with start/end times and late thresholds.

### 3.8. Attendance — `/attendance`
- Monthly/weekly attendance calendar.
- Record: present, absent, late, deduction — with reason and amount.
- Check-in / check-out time tracking.
- Overtime calculation from check-in/out times.
- Reset entire month.

### 3.9. Payroll — `/payroll`
- **Monthly Payroll**: net = base salary + daily rate × present days + incentives + commissions - deductions - advances - penalties.
- **Weekly Payroll**: same calculation on weekly basis.
- **Payroll Approval**: approve monthly or weekly salary runs.
- **Export to Accounting**: generate journal entries from approved payroll.
- **Commissions**: marketer commission approval (percentage / per-ton / tiered).
- **Daily Incentives**: approve daily attendance incentives.
- **Leave**: 21 days annual leave accrual, deduction from balance.

### 3.10. Marketing — `/marketing`
- Campaign management, offers/discounts.
- Lead tracking.
- Sales performance by marketer.

### 3.11. Accounting — `/accounting`
- **Treasury**: current balance display with manual adjustment.
- **Bank Accounts**: add, update balance, delete.
- **Electronic Wallets**: Vodafone Cash & InstaPay with maximum limit.
- **Cash In/Out**: record cash movements with method selection.
- **Customer Collection**: collect receivables with auto-allocation to invoices.
- **General Ledger**: chronological log of all transactions with running balance.
- **Trial Balance**: comprehensive report (treasury, banks, wallets, customers, suppliers, payroll, sales, procurement, expenses).
- **Fund Transfer**: move money between treasury, banks, and wallets.
- **Arabic Number to Words**: convert any amount to written Arabic (millions, thousands, etc.).
- **CSV Export**: export general ledger.

### 3.12. Procurement — `/procurement`
- **Suppliers**: full management (name, phone, code, address, material, outstanding debt).
- **Purchase Orders**: create PO with multiple items (material, qty, unit, unit price), status (pending / approved / delivered / paid / overdue).
- **Returns**: return partial or full PO.
- **Payments**: pay suppliers with auto-allocation to POs and debt update.

### 3.13. Pricing — `/pricing`
- **Product Pricing**: wholesale, retail, distributor, minimum sale, cost price per product.
- **Price History**: last 50 changes per product with timestamps.
- **Formula Cost**: auto-calculate cost from raw material prices in formula.
- **Procurement Sync**: pull latest purchase prices from approved POs.
- **Pricing Alerts**: alert when product cost changes (manual or auto).
- **Groups**: organize products into named groups with custom margins.
- **Bulk Recalculation**: recalculate all formula costs at once.

### 3.14. Profit — `/profit`
- **Revenue**: total sales invoices minus returns for the selected period.
- **COGS**: cost price × quantity sold per item.
- **Gross Profit**: revenue - COGS + margin %.
- **Net Profit**: gross profit - operating expenses (procurement + fleet + payroll).
- **Time Range**: today / week / month / custom.
- **Summary Cards**: Revenue, COGS, Gross Profit + %, Net Profit + %.
- **Cost Breakdown**: operating expenses by type.
- **Daily Table**: profit distributed across individual days.
- **Methodology Legend**: full explanation of every calculation.

### 3.15. Reports — `/reports`
- Customizable reports: toggle modules (sales, inventory, HR, fleet, procurement, pricing, alerts, margins).
- Date filter: all / today / range.
- Charts: area (sales), bar (inventory), pie (distribution).
- Print-ready with company logo, address, professional formatting.
- PDF download.
- KPIs: total sales, critical inventory, employee count, vehicle count, customer/supplier debt.

### 3.16. AI Assistant — `/ai-assistant`
- Direct integration with Google Gemini API.
- User-provided API key (stored in localStorage, not hardcoded).
- Ask questions about factory operations, production, feed formulations.
- Bilingual conversation (Arabic/English).
- Markdown formatting in responses.

### 3.17. Settings — `/settings`
- **Company**: name, address, logo (image upload).
- **Appearance**: Dark/Light mode.
- **Language**: Arabic/English.
- **Active Modules**: toggle visibility of each module in sidebar.
- **Sidebar Order**: drag-and-drop module reordering.
- **Invoice Settings**: paper size, orientation, font size, show logo.
- **Report Settings**: same options as invoice.
- **Discount**: max discount %, allow override.
- **Tax**: enable VAT, percentage.
- **Overdue**: enable, days/months threshold.
- **Payroll**: monthly release day, advance days, weekly release day.
- **Expense Categories**: add/delete fleet expense types.
- **System Reset**: clear all data with confirmation.
- **Backup**: create, restore, export, import.
- **API Keys**: Gemini API key input.
- **Keyboard Shortcuts**: full reference.

### 3.18. Sub Accounts — `/sub-accounts`
- Add sub-account (name, email, password, permissions per module).
- Edit, delete, enable/disable.
- Fine-grained feature permissions (create, edit, delete, print, export).
- Special permission toggles (exceed discount, pricing, HR, payroll).

### 3.19. Activity Log — `/activity-log`
- Timeline view of all system events.
- Multi-filter: module, action, user, date (today/week/month/custom).
- Text search.
- Pagination (50 per page).
- JSON export.
- Print view (HTML template).
- Clear all with confirmation dialog.

---

## 4. Installation & Setup

### Development
```bash
cd artifacts/feedflow-erp
pnpm install
pnpm run dev        # http://localhost:5173
```

### Production — Network Server
`start-server.cmd` — builds and starts the server at `http://192.168.137.1:8080` (auto-detects local IP). Any device on the same WiFi can access it.

### Public Internet Tunnel
`tunnel.cmd` — downloads Cloudflare tunnel automatically and provides a public HTTPS URL (e.g. `https://xxxxx.trycloudflare.com`). Requires the server to be running on `localhost:8080`.

### All-in-One
`start-online.cmd` — opens both windows: server + tunnel.

### Full Network Build
`deploy-network.cmd` — builds frontend + API server, starts on port 8080.

### Requirements
- Node.js 20+
- pnpm (dependencies install automatically)
- PostgreSQL (for the API server only — the frontend works without it)

---

## 5. Data Flow & Storage

```
Component → Zustand Store → Dexie.js (IndexedDB) → localStorage (fallback)
                ↓
         Activity Log (every operation recorded)
                ↓
         Notification Checker (every 30 seconds)
                ↓
         Auto Backup (every 6 hours)
```

- **No external API required.** Everything works locally.
- **3-Layer Backup**: localStorage, IndexedDB (Dexie), manual JSON export/import.
- **Auto-migration**: data migrates from localStorage to Dexie on version updates.

---

## 6. UI Components

64 shadcn/ui components including:

| Category | Components |
|---|---|
| **Animated** | TiltCard, ScrollReveal, TextReveal, ParticleField, MeshGradient, RippleEffect, MagneticButton |
| **Smart Input** | Autocomplete, spellcheck, autocorrect for Arabic/English feed terms |
| **Charts** | Area, Bar, Pie (Recharts) |
| **Layout** | Dialog, Sheet, Drawer, Popover, Dropdown Menu, Context Menu, Navigation Menu, Tabs, Accordion, Collapsible, Resizable, Scroll Area, Sidebar, Separator |
| **Forms** | Input, Select, Checkbox, Radio Group, Switch, Textarea, Slider, Input OTP |
| **Feedback** | Alert, Alert Dialog, Progress, Skeleton, Sonner (toast), Spinner, Toast |
| **Data Display** | Badge, Avatar, Calendar, Chart, Table, Card, Carousel |
| **Navigation** | Breadcrumb, Command (Cmd+K style), Pagination, Tabs |

---

## 7. Module Index (for developers)

| Path | Module |
|---|---|
| `/` | Dashboard |
| `/production` | Production |
| `/inventory` | Inventory |
| `/sales` | Sales |
| `/customers` | Customers |
| `/fleet` | Fleet & Delivery |
| `/hr` | HR |
| `/attendance` | Attendance |
| `/payroll` | Payroll |
| `/marketing` | Marketing |
| `/accounting` | Accounting |
| `/procurement` | Procurement |
| `/pricing` | Pricing & Cost |
| `/profit` | Profit |
| `/reports` | Reports |
| `/ai-assistant` | AI Assistant |
| `/settings` | Settings |
| `/sub-accounts` | Sub Accounts |
| `/activity-log` | Activity Log |

---

## 8. Permissions System

- **Module Permissions**: 3 levels per module — No Access / View Only / Full Access.
- **Feature Permissions**: 30+ granular features (e.g., `sales.create`, `production.delete`, `activity_log.export`).
- **Special Permissions**: exceed discount, access pricing, access HR, access payroll.
- **Enforcement**: `usePermission()` hook checks permissions before rendering any action button.
- **Admin**: bypasses all permission checks.

---

*FeedFlow ERP v1.0 — El-Nujoom Feeds Factory — feedflow.ai*
