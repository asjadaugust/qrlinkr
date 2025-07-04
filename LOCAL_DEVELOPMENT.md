# QRLinkr Local Development Setup

## 🚀 Quick Start - Local Development

### Option 1: Database-Only Docker (Recommended for Development)

This approach runs only PostgreSQL in Docker while running the backend and frontend natively on your machine for faster development cycles.

#### 1. Start the Database
```bash
# Start only the PostgreSQL database
docker-compose -f docker-compose.test.yml up -d

# Verify database is running
docker-compose -f docker-compose.test.yml ps
```

#### 2. Setup Environment Variables
```bash
# Create local .env file (already done)
cp .env.example .env

# The .env file should contain:
DATABASE_URL=postgresql://qrlinkr_user:changeme_in_production@localhost:5432/qrlinkr
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
PORT=3001
NODE_ENV=development
```

#### 3. Install Dependencies
```bash
# Install all project dependencies
npm install
```

#### 4. Setup Database Schema
```bash
# Generate Prisma client and run migrations
cd backend
npx prisma generate
npx prisma db push
```

#### 5. Start Backend (Terminal 1)
```bash
# Start the backend server
cd backend
npm run dev
```

#### 6. Start Frontend (Terminal 2)
```bash
# Start the frontend server
cd frontend  
npm run dev
```

#### 7. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432

---

### Option 2: Full Docker Stack

If you prefer to run everything in Docker:

```bash
# Stop any running containers
docker-compose down -v

# Start the full application stack
docker-compose up -d

# Check logs
docker-compose logs -f
```

---

### 🛠 Development Commands

#### Database Management
```bash
# Reset database (caution: deletes all data)
cd backend && npx prisma db push --force-reset

# View database with Prisma Studio
cd backend && npx prisma studio

# Generate Prisma client after schema changes
cd backend && npx prisma generate
```

#### Testing
```bash
# Run backend tests
cd backend && npm test

# Run frontend tests  
cd frontend && npm test
```

#### Building for Production
```bash
# Build backend
cd backend && npm run build

# Build frontend
cd frontend && npm run build
```

---

### 📝 Notes

- **Hot Reload**: Native development provides faster hot reload for both backend and frontend
- **Database**: PostgreSQL runs in Docker but is accessible at localhost:5432
- **Environment**: All environment variables are loaded from the `.env` file
- **Ports**: Frontend (3000), Backend (3001), Database (5432)

---

### 🔧 Troubleshooting

#### Database Connection Issues
```bash
# Check if database is accessible
pg_isready -h localhost -p 5432 -U qrlinkr_user

# Or test with docker
docker-compose -f docker-compose.test.yml exec db psql -U qrlinkr_user -d qrlinkr -c "SELECT 1;"
```

#### Port Conflicts
If you get port conflict errors:
```bash
# Check what's using the ports
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :5432  # Database
```

#### Reset Everything
```bash
# Stop all containers and remove volumes
docker-compose -f docker-compose.test.yml down -v
docker-compose down -v

# Remove node_modules and reinstall
rm -rf node_modules backend/node_modules frontend/node_modules
npm install
```
