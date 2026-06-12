# ELFT Flu Vaccination Management Platform

A Next.js web application for managing the annual flu vaccination campaign at East London NHS Foundation Trust. Provides role-based access for staff, vaccinators, and flu leads.

## Local Development Setup

### Prerequisites
- Node.js 20+
- npm or pnpm

### 1. Clone and install

```bash
git clone <repo-url>
cd elft-flu-vaccination
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

For local development, use SQLite:
```
DATABASE_URL="file:./prisma/dev.db"
```

Generate `AUTH_SECRET`:
```bash
openssl rand -base64 32
```

For Azure AD values, see the **Azure App Registration** section below.

### 3. Set up the database

```bash
npm run db:generate   # generate Prisma client
npm run db:push       # create SQLite schema
npm run db:seed       # seed test data
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Test accounts (seed data)

| Email | Role | Status |
|-------|------|--------|
| sarah.johnson@nhs.net | Flu Lead | Vaccinated at ELFT |
| james.okafor@nhs.net | Vaccinator | Vaccinated at ELFT |
| priya.sharma@nhs.net | Staff | Vaccinated elsewhere |
| david.chen@nhs.net | Staff | Declined |
| amara.diallo@nhs.net | Staff | Not recorded |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AUTH_SECRET` | Random secret for signing session tokens. Generate with `openssl rand -base64 32` |
| `AZURE_AD_CLIENT_ID` | Azure App Registration client ID |
| `AZURE_AD_CLIENT_SECRET` | Azure App Registration client secret |
| `AZURE_AD_TENANT_ID` | Your NHS Entra ID tenant ID |
| `DATABASE_URL` | SQLite file path (dev) or Azure SQL connection string (prod) |
| `NEXTAUTH_URL` | Full URL of the app, e.g. `https://flu.elft.nhs.uk` |

---

## Azure App Registration Setup

Submit a request to ELFT IT/Digital asking for an **App Registration** in the ELFT Microsoft Entra ID tenant with the following configuration:

1. **Name:** ELFT Flu Vaccination
2. **Supported account types:** Accounts in this organisational directory only (ELFT single tenant)
3. **Redirect URIs:** Web → `https://flu.elft.nhs.uk/api/auth/callback/microsoft-entra-id`
   - Also add: `http://localhost:3000/api/auth/callback/microsoft-entra-id` for local dev
4. **Client secret:** Create a secret with 12-month expiry. Copy the **value** (not the ID).
5. **Permissions (API):** No additional permissions needed beyond the default `openid`, `profile`, `email`.
6. Once created, copy:
   - **Application (client) ID** → `AZURE_AD_CLIENT_ID`
   - **Directory (tenant) ID** → `AZURE_AD_TENANT_ID`
   - **Client secret value** → `AZURE_AD_CLIENT_SECRET`

---

## Importing ESR Staff Data via CSV

The seed script accepts a CSV file to bulk-import staff records.

### CSV format

Your CSV must have a header row. Supported column names (case-insensitive):

| Column | Required | Notes |
|--------|----------|-------|
| `email` or `email address` | Yes | Must match NHS account email |
| `firstname` or `first name` | Yes | |
| `lastname` or `last name` or `surname` | Yes | |
| `assignment number` | No | ESR assignment number |
| `directorate` | No | |
| `team` | No | |
| `job title` | No | |
| `frontline` | No | `false` to exclude from denominator; default `true` |

### Running the import

```bash
npm run db:seed:csv -- --csv /path/to/staff-export.csv
```

Or directly:
```bash
tsx prisma/seed.ts --csv /path/to/staff-export.csv
```

The script uses upsert — safe to run multiple times. Existing records are updated; new records are created with `UNKNOWN` vaccination status.

---

## Azure Deployment

### Prerequisites
- Azure subscription
- Azure CLI installed and logged in
- Azure App Service plan (B2 or higher recommended)
- Azure SQL Database (or keep SQLite for low-volume use)

### 1. Create resources

```bash
# Resource group
az group create --name elft-flu-rg --location uksouth

# App Service plan
az appservice plan create \
  --name elft-flu-plan \
  --resource-group elft-flu-rg \
  --sku B2 \
  --is-linux

# Web app
az webapp create \
  --name elft-flu \
  --resource-group elft-flu-rg \
  --plan elft-flu-plan \
  --runtime "NODE:20-lts"
```

### 2. Configure environment variables

```bash
az webapp config appsettings set \
  --name elft-flu \
  --resource-group elft-flu-rg \
  --settings \
    AUTH_SECRET="<your-secret>" \
    AZURE_AD_CLIENT_ID="<client-id>" \
    AZURE_AD_CLIENT_SECRET="<client-secret>" \
    AZURE_AD_TENANT_ID="<tenant-id>" \
    DATABASE_URL="sqlserver://<server>.database.windows.net:1433;database=elft-flu;user=<user>;password=<pass>;encrypt=true" \
    NEXTAUTH_URL="https://flu.elft.nhs.uk" \
    NODE_ENV="production"
```

### 3. Provision Azure SQL schema

The production schema lives at `prisma/schema.production.prisma` (SQL Server provider).
The development schema at `prisma/schema.prisma` uses SQLite — **never change that file**.

On first deploy, or whenever the schema changes, run against the Azure SQL database:

```bash
# Point DATABASE_URL at Azure SQL first
export DATABASE_URL="sqlserver://elft-sql.database.windows.net:1433;database=flu-vaccination;user=flu-app;password=YOURPASSWORD;encrypt=true"

# Push schema to Azure SQL (creates all tables)
npm run db:push:prod

# Optional: seed with initial clinic data
npm run db:seed
```

For subsequent schema changes in production, prefer migrations over push:

```bash
npm run db:migrate:prod
```

### 4. Build and deploy

On Azure App Service, set the **startup command** (or CI build step) to use the production schema:

```bash
npm run build:prod   # runs: prisma generate --schema=prisma/schema.production.prisma && next build
```

To deploy manually via zip:

```bash
npm run build:prod

zip -r deploy.zip .next public package.json package-lock.json next.config.ts prisma/

az webapp deploy \
  --name elft-flu \
  --resource-group elft-flu-rg \
  --src-path deploy.zip \
  --type zip
```

### 5. Custom domain

Configure `flu.elft.nhs.uk` to point to the Azure App Service via CNAME, then add the custom domain in the Azure portal under **Custom domains**.

---

## Architecture

```
app/
  page.tsx              — Landing page / sign-in
  dashboard/            — Post-login role router
  my-record/            — Staff view (own record + update)
  vaccinator/           — Vaccinator portal (search + record)
  admin/                — Flu Lead dashboard (stats + tables)
  clinics/              — Clinic list + add
  not-found-staff/      — Shown when email not in Staff table
  api/
    auth/[...nextauth]/ — NextAuth handlers
    staff/me/           — Own staff record
    staff/search/       — Staff search (vaccinator/flu lead)
    vaccination/update/ — Update vaccination status
    clinics/            — CRUD clinics
    admin/stats/        — Dashboard stats
    admin/export/       — CSV export
    admin/roles/        — Role management

components/
  layout/               — Header, Footer, SessionWrapper
  ui/                   — StatusBadge, StaffCard, ClinicCard, ConfirmModal, StatsCard
  admin/                — DirectorateTable, StaffTable, RoleManager
```

## QR Code Clinic Flow

Generate QR codes pointing to:
```
https://flu.elft.nhs.uk?site=mile-end-hospital
```

After login, the `site` parameter pre-populates the vaccination update form. Staff see the clinic location confirmed before selecting their status.

---

*Built by ELFT Data & Analytics · 2026*
