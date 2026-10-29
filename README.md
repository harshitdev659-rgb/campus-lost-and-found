# CampusFind — University Lost & Found Platform

A complete, production-ready, security-first Campus Lost & Found Platform designed for colleges and universities. Replaces disorganized WhatsApp group chats and bulletin boards with a centralized, searchable, and trustworthy platform with cryptographic ownership verification and safe campus handovers.

---

## 🌟 Key Features

### 1. Modern, Mobile-First User Experience
- **Public Landing Page**: Search bar, category quick-pills, live recently reported items feed, statistics, and 3-step verification guide.
- **Campus Design System**: Professional navy/slate palette (`#162842` / `#1e3a5f`), accessible WCAG-compliant contrast, responsive cards, and clean typography.
- **Categorization Across Campus**: 11 university categories (Electronics, ID Cards, Books and Notes, Bags, Stationery, Clothing, Accessories, Keys, Bottles, Lab Equipment, Other).
- **Location Breakdown**: Campus zones, specific buildings, blocks, floors, and classroom/laboratory numbers.

### 2. Privacy & Anti-Fraud Ownership Verification
- **Zero Exposed Phone Numbers**: All communications and handovers occur in-app without leaking personal contact info publicly.
- **Confidential Distinguishing Features**: Identifying details (lock screen wallpaper, sticker layout, engravings) are concealed from public discovery.
- **Cryptographic Verification Questions**: Finders set security questions. Expected answers are evaluated using **bcrypt password-style hashes** so raw answers are never leaked to claimants or network sniffers.
- **Rate-Limiting Protection**: Repeated guess attempts are strictly capped (max 5 attempts) to prevent brute-force ownership fraud.

### 3. Claim Lifecycle & Physical Handover
- **State Machine**: `PENDING` ➔ `UNDER_REVIEW` ➔ `APPROVED` / `REJECTED` ➔ `COMPLETED` (Handover Confirmed).
- **In-App Messaging**: Real-time communication between claimant and finder to discuss details safely.
- **Campus Handover Coordination**: Schedule safe meetings at campus security desks or student unions. Marking a handover as completed atomically updates the report to `RESOLVED`.

### 4. Administrator & Moderation Console
- **Platform Analytics**: Total users, active listings, recovered belongings count, and pending claims.
- **Content Moderation Queue**: Community flags review with one-click hide/restore actions.
- **User Permission Management**: Promote or revoke Student, Staff, and Administrator roles.
- **Security Audit Trail**: Immutable logging of sensitive actions (logins, status changes, handovers, moderation) with zero secrets leaked.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) + TypeScript |
| **Styling** | Tailwind CSS + Lucide Icons |
| **Database** | Relational Database via Prisma ORM (SQLite / PostgreSQL) |
| **Authentication** | JWT (`jsonwebtoken`) in HTTP-Only cookies + `bcryptjs` password hashing |
| **Security** | Server-side RBAC, MIME-type magic byte validation, Rate limiting, Audit logs |
| **Testing** | Node.js native test suite (`node:test`, `node:assert/strict`) |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default configuration:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="campus-lost-found-super-secure-jwt-secret-key-32chars-min"
ALLOWED_CAMPUS_DOMAINS="campus.edu,university.edu,college.edu,student.edu,gmail.com"
NEXT_PUBLIC_APP_NAME="CampusFind - University Lost & Found"
NEXT_PUBLIC_CAMPUS_NAME="University Campus Central"
```

### 3. Initialize & Seed Database
Pushes the schema and seeds realistic test data:
```bash
npx prisma db push
npm run db:init
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Test Accounts (Pre-Seeded)

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@campus.edu` | `Admin@Pass123` | Full admin metrics, moderation, audit logs |
| **Student (Finder)** | `jane@campus.edu` | `Student@Pass123` | Found keys with verification questions |
| **Student (Owner)** | `student@campus.edu` | `Student@Pass123` | Lost MacBook Pro report |

*(You can also use the 1-click test account fill buttons on the Sign In page).*

---

## 🔬 Running Automated Tests
Run the test suite verifying cryptographic hashing, domain rules, and state machine transitions:
```bash
npm test
```

---

## 🌐 Live Website Deployment & Submission Guide

### Option A: Instant Live Public URL (Zero-Deploy Cloudflare Tunnel / Pinggy)
To get an immediate live HTTPS link to submit right away without configuring cloud accounts:
```bash
# In terminal 1:
npm run dev

# In terminal 2:
npx pinggy.io -p 3000
# or:
npx localtunnel --port 3000
```
This generates an instant, public HTTPS address accessible anywhere in the world.

### Option B: Deploy to Render (Blueprint)
1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Campus Lost & Found Platform"
   git remote add origin https://github.com/<your-username>/campus-lost-and-found.git
   git push -u origin main
   ```
2. Log in to [Render.com](https://render.com) and click **New > Blueprint**.
3. Select your repository. The included `render.yaml` automatically builds, seeds, and starts the service.
4. Render provides a live URL (e.g., `https://campus-lost-and-found.onrender.com`).

### Option C: Deploy to Vercel
1. Install Vercel CLI or connect via GitHub on [vercel.com](https://vercel.com).
2. Set the Environment Variables (`DATABASE_URL`, `JWT_SECRET`, `ALLOWED_CAMPUS_DOMAINS`).
3. Deploy! Vercel will build the Next.js App Router app seamlessly.

---

## 🛡️ Security Audit & Privacy Compliance
- **No Client-Side Authorization**: Permissions are validated on every server endpoint (`requireAuth`, `requireAdmin`).
- **Answer Security**: Expected verification answers are passed through `bcrypt` with salt rounds. Raw strings are never returned by the GET endpoints.
- **File Upload Safeguards**: MIME types are checked, file size is limited to 5MB, file headers/magic bytes are verified, and filenames are randomized to prevent path traversal or executable execution.
- **Audit Logging**: All significant actions are recorded in the `AuditEvent` table with passwords and sensitive tokens redacted.
