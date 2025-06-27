# Copilot Instructions for QRLinkr – Dynamic QR Redirection Platform

## 🧭 Overview

QRLinkr is a dynamic QR code redirection platform. It allows users to generate permanent QR codes tied to short URLs that can be remapped to different destinations at any time. The core purpose is to eliminate the need for reprints when website URLs change. Copilot should generate code that emphasizes user-friendly UX, fast redirection, and robust link mapping.

---

## 📦 Stack Expectations

* **Frontend**: Next.js (React) + TailwindCSS
* **Backend**: Node.js + Fastify (or Express)
* **Database**: PostgreSQL (via Prisma)
* **Authentication**: Clerk or Firebase Auth
* **QR Generation**: `qrcode` npm library
* **Storage**: PostgreSQL with Prisma ORM
* **Hosting**: Vercel (frontend), Railway/Fly.io/Render (backend)
* **Domain**: qrlinkr.com

---

## 📁 Project Structure

```
root/
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/         # API calls
│   └── styles/
├── backend/
│   ├── routes/
│   ├── services/
│   └── prisma/           # Prisma schema & migrations
└── shared/
    └── types/
```

---

## 💡 Key Features for Copilot to Support

### 1. QR Code Generation

* Create short ID (e.g., `/qrlinkr.com/abcdefg`)
* Generate and display QR for the short URL
* Export as PNG, SVG, or download button

### 2. URL Mapping & Redirection

* Store mapping in DB: `{ id, original_url, fallback_url, owner_id }`
* API endpoint `/api/r/:id` → redirect to original\_url or fallback
* Support HTTP 302 redirect for SEO compatibility

### 3. Authenticated Dashboards

* Users can create, edit, delete, and re-map QR destinations
* Only owner can modify their links
* Display analytics (scan count, last scanned time)

### 4. Analytics

* Log scan events: IP, timestamp, device info
* Show scan history per QR link
* Aggregate view for total scans, top links

### 5. Branding Support

* Allow custom domain mapping (`link.mycompany.com`) via DNS records
* Show branded QR if configured

---

## 🧪 Testing Expectations

* Use Jest + React Testing Library (frontend)
* Use supertest + vitest for backend route validation
* Include unit tests for:

  * QR ID generation
  * URL redirection logic
  * User authentication guard

---

## ✅ API Design Sample

```json
POST /api/qr/new
{
  "destination": "https://newsite.com",
  "custom_slug": "ajdev"
}
```

```http
GET /api/r/abcdefg → HTTP 302 → https://mappedsite.com
```

---

## 📂 Prisma & MCP Integration

* Use Prisma ORM with PostgreSQL.
* Define all models in `backend/prisma/schema.prisma`.
* Example models: `qrLink`, `user`, `analyticsEvent`
* Enable MCP support for Copilot to help with migrations, schema editing, and queries.
* Add `.vscode/mcp.json`:

```json
{
  "mcpServers": {
    "Prisma": {
      "command": "npx",
      "args": ["prisma", "mcp", "--early-access"]
    }
  }
}
```

---

## 🔁 Copilot Tips

* Use `nanoid` for generating unique slugs
* Use `zod` or `yup` for input validation
* Redirect with Fastify’s `reply.redirect(302, destination)`
* Cache redirect results in memory or Redis for performance
* Use `.env` for secrets and `BASE_URL`, `REDIRECT_TTL`

---

QRLinkr is the persistent link behind your printed QR codes—build it with simplicity, safety, and speed in mind. Prisma + MCP unlock full Copilot capabilities in schema management and backend logic.
