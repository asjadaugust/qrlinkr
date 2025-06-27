# Product Requirements Document: QRLinkr – Persistent QR Redirection Platform

## 🧭 Summary

**QRLinkr** solves the problem of obsolete QR codes by introducing a persistent, redirectable QR code system. It allows users to generate a permanent QR code that points to a dynamic redirect URL, which they can update anytime. This prevents the need for reprints on business cards, banners, or product packaging.

---

## 💡 Core Use Case

Business owners, freelancers, or anyone printing QR codes on physical materials often face the issue of outdated URLs due to domain changes, rebranding, or restructuring. QRLinkr ensures a QR code printed once can live forever.

---

## 🎯 Goals

* Generate a permanent QR code linked to a short URL.
* Allow users to remap the destination URL anytime.
* Optional custom domain support.
* Easy download in standard image formats.
* Basic analytics (scan count, timestamps).

---

## 🗂 Functional Requirements

| ID    | Feature               | Description                                                                   |
| ----- | --------------------- | ----------------------------------------------------------------------------- |
| FR001 | Generate Permanent QR | Create a unique short URL (e.g. `/abcdefg`) and associated QR code.           |
| FR002 | URL Mapping           | User can set/update the redirect destination.                                 |
| FR003 | Dynamic Redirect      | When a QR is scanned (or short URL visited), redirect to mapped destination.  |
| FR004 | Empty Fallback        | If no URL is set, show a blank or default landing page.                       |
| FR005 | QR Export             | Allow QR download as PNG, SVG, EPS.                                           |
| FR006 | Custom Domain Mapping | Map custom domains or branded slugs (e.g. `/ajdev`).                          |
| FR007 | Analytics             | Log and display basic scan stats (IP, timestamp, country).                    |
| FR008 | Auth & Ownership      | Users must log in to create/edit QR codes.                                    |
| FR009 | MCP-Driven Prisma ORM | Use Prisma with PostgreSQL and support MCP Agent Mode integration in VS Code. |

---

## ⚙ Technical Architecture

### Frontend

* **Next.js + TailwindCSS**
* **qrcode.react** or `qrcode` npm library for QR rendering

### Backend

* **Node.js + Fastify**
* **Prisma ORM** with **PostgreSQL**
* **API routes for redirect and CRUD**

### Prisma & MCP Server

* Use Prisma ORM for schema definition and queries.
* Integrate `.vscode/mcp.json` for Prisma MCP agent mode:

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

* Enables Copilot schema awareness, migration generation, and seed support.

### Authentication

* **Clerk** or **Firebase Auth**

### Hosting & DevOps

* **Frontend**: Vercel
* **Backend**: Railway / Fly.io / Render
* **DNS Management**: Cloudflare

---

## 🔄 Redirect Flow (Simplified)

1. User visits `https://qrlinkr.com/abcdefg`
2. Backend looks up `abcdefg` via Prisma
3. If `original_url` exists → return HTTP 302 → `original_url`
4. If not mapped → render blank or default fallback page

---

## 🧪 MVP Checklist

* ✅ User can register and log in
* ✅ User can generate QR + shortlink
* ✅ User can map and re-map the destination URL
* ✅ QR export (PNG, SVG)
* ✅ Redirect endpoint with HTTP 302
* ✅ Show scan history (count, time, IP)
* ✅ Optional custom slugs or domains
* ✅ Fallback landing page if destination is missing
* ✅ Basic scan analytics (timestamp, region, device type)
* ✅ Admin endpoint to remove or reset link mapping
* ✅ Prisma schema defined for QR, user, and analytics models
* ✅ MCP server enabled in .vscode for agent-based editing

---

## 📈 Future Enhancements

* 🎨 Custom QR Styling (color, logo, shape)
* 🕓 Scheduled Redirects (e.g., change destination after a date)
* 🧾 Domain purchase and auto-mapping
* 📊 Full analytics dashboard (heatmap, scans by device/time)
* 🔐 Webhook support for automation

---

## 🧠 Competitive Differentiator

Think of this as the **Bitly for printed QR codes** — but smarter:

* Persistence-first
* No broken links on business cards
* Custom branding
* Real-time control
* VSCode + Prisma MCP integration for instant feedback

---

## 🧱 Dependencies

* PostgreSQL
* Prisma ORM
* Clerk or Firebase (Auth)
* Cloudflare
* Next.js, Fastify
* Vercel, Railway

---

## 🔚 Conclusion

QRLinkr ensures your printed materials remain up-to-date without ever changing your QR code. It’s built for long-term ownership of links in the physical world, and now fully integrates Prisma with MCP support for Copilot-aware backend development.
