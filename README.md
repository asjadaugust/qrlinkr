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
- **Analytics**: Track scans, devices, and more (coming soon).
- **Authentication**: Secure your links (Clerk/Firebase ready).
- **Branding**: Custom domains and branded QR codes (coming soon).

---

## 🧭 Project Structure

```
qrlinkr/
├── frontend/     # Next.js + TailwindCSS (UI)
├── backend/      # Fastify + Prisma (API)
├── shared/       # Shared types/interfaces
└── .github/      # GitHub Actions workflows
```

---

## 🛠️ Getting Started (Windows)

### Prerequisites
- [Node.js 20+](https://nodejs.org/en/download/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git for Windows](https://git-scm.com/download/win)

### 1. Clone the Repository
```sh
git clone <your-repository-url>
cd qrlinkr
```

### 2. Configure Backend Environment
```sh
cd backend
copy .env.example .env   # Or use PowerShell: Copy-Item .env.example .env
cd ..
```

### 3. Start the Database
```sh
docker-compose up -d
```

### 4. Install Dependencies
```sh
npm install
```

### 5. Run Database Migrations
```sh
cd backend
npx prisma migrate dev
cd ..
```

### 6. Start the App (Dev Mode)
```sh
npm run dev
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:3001

---

## 📦 Tech Stack
- **Frontend**: Next.js, React, TailwindCSS, Material-UI
- **Backend**: Fastify, Node.js, TypeScript
- **Database**: PostgreSQL (Docker), Prisma ORM
- **QR Generation**: `qrcode` npm library
- **Dev Tools**: Docker, npm Workspaces, Concurrently

---

## 📝 License
MIT

---

<div align="center">
  <sub>Made with ❤️ for persistent, flexible QR links.</sub>
</div>
