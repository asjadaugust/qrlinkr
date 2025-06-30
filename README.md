<div align="center">
  <h1>🚀 QRLinkr 🚀</h1>
  <p><strong>A dynamic QR code redirection platform that never lets your links die.</strong></p>
  <p>Create permanent QR codes tied to short URLs that can be remapped to different destinations at any time. No more reprinting when a website URL changes!</p>
  <br />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white">
  <img alt="Fastify" src="https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white">
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white">
  <img alt="Docker" src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white">
</div>

---

## ✨ Features

- **Dynamic QR Codes**: Generate QR codes with short URLs that can be remapped anytime.
- **Permanent Links**: Never reprint a QR code again—just update the destination.
- **Custom Slugs**: Choose your own memorable short URLs.
- **Dashboard**: Manage, edit, and delete your QR links in a beautiful UI.
- **Analytics**: Track scans with timestamps, IP addresses, and user agent data.
- **Customizable QR Codes**: Choose colors, error correction levels, and more.
- **Authentication**: Secure your links (ready for Clerk/Firebase Auth integration).
- **Branding Support**: Custom domains support (coming soon).
- **Responsive Design**: Works seamlessly across desktop and mobile devices.

---

## 🧭 Project Structure

```
qrlinkr/
├── frontend/     # Next.js + Material UI (UI)
│   ├── components/   # Reusable UI components
│   ├── src/app/      # Next.js pages and routing
│   └── lib/          # API clients and utilities
├── backend/      # Fastify + Prisma (API)
│   ├── src/          # Source code
│   │   ├── routes/   # API endpoints
│   │   └── index.ts  # Main server file
│   └── prisma/       # Database schema and migrations
├── shared/       # Shared types/interfaces
└── .github/      # GitHub Actions workflows
```

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js 20+](https://nodejs.org/en/download/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/downloads)

### 1. Clone the Repository
```sh
git clone <your-repository-url>
cd qrlinkr
```

### 2. Configure Environment
```sh
# Root directory
cp .env.example .env

# Backend
cd backend
cp .env.example .env
cd ..
```

### 3. Start with Docker Compose
```sh
docker-compose up -d
```

This command starts:
- PostgreSQL database
- Backend API server (Fastify)
- Frontend app (Next.js)

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### 5. Development Mode (Without Docker)

Install dependencies:
```sh
npm install
```

Run database migrations:
```sh
cd backend
npx prisma migrate dev
cd ..
```

Start development servers:
```sh
npm run dev
```

---

## 📊 Analytics

QRLinkr tracks the following data for each QR code scan:
- Scan timestamp
- IP address (anonymized for privacy)
- User agent information
- Total scan count

View your scan analytics in the dashboard by clicking the analytics icon for any QR link.

---

## 🎨 Customization Options

QRLinkr offers multiple customization options for your QR codes:
- Custom foreground and background colors
- Error correction levels (L, M, Q, H)
- Margin options
- Size configuration
- Download as PNG format

---

## 🚀 Deployment

### Production with Docker Compose

1. Configure production environment:
```sh
cp .env.production.example .env.production
```

2. Deploy with docker-compose:
```sh
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment
- Frontend: Deploy to Vercel or similar service
- Backend: Deploy to Railway, Fly.io, or Render
- Database: Use a managed PostgreSQL service or self-host

---

## 📦 Tech Stack

- **Frontend**: Next.js, React, Material-UI
- **Backend**: Fastify, Node.js, TypeScript
- **Database**: PostgreSQL, Prisma ORM
- **QR Generation**: `qrcode.react` library
- **Dev Tools**: Docker, TypeScript, ESLint

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
