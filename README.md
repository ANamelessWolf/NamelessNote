# NamelessNote Monorepo (Scaffold)

- **backend/**: TypeScript + Express + Swagger
- **frontend/**: placeholder
- **docker-compose.yml**: Mongo + Backend (+ Frontend futuro)

## Backend local
```bash
cd backend
cp .env.example .env
npm install
npm run dev
# http://localhost:4000/health
# http://localhost:4000/docs
```

## Docker
```bash
docker compose up -d --build
```
