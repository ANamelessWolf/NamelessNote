# NamelessNote Monorepo (Scaffold)

- **backend/**: TypeScript + Express + Swagger
- **frontend/**: placeholder
- **docker-compose.yml**: Mongo + Backend (+ Frontend futuro)
- **certs/**: certificados locales para HTTPS de desarrollo

## Backend local
```bash
cd backend
cp .env.example .env
npm install
npm run dev
# http://localhost:4000/health
# http://localhost:4000/docs
```

## HTTPS local con certificado de desarrollo
Se dejo soporte opcional para HTTPS tanto en frontend como en backend. Los certificados deben vivir en `certs/` en la raiz del repo y no se suben a git.

### 1. Instalar mkcert
Windows con Chocolatey:
```powershell
choco install mkcert
```

Windows con Scoop:
```powershell
scoop install mkcert
```

Si usas Firefox, en algunos equipos tambien hace falta:
```powershell
choco install nss
```

### 2. Crear e instalar la CA local
```powershell
mkcert -install
```

Esto crea una autoridad certificadora local confiable en tu equipo.

### 3. Generar el certificado para desarrollo
Desde la raiz del repo:
```powershell
New-Item -ItemType Directory -Force certs
mkcert -cert-file certs/namelessnote-local.pem -key-file certs/namelessnote-local-key.pem localhost 127.0.0.1 ::1 192.168.1.235
```

Si cambias de IP local, vuelve a generar el certificado incluyendo la nueva IP.

### 4. Habilitar HTTPS en backend
En `backend/.env`:
```dotenv
HTTPS_ENABLED=true
HTTPS_CERT_FILE=../certs/namelessnote-local.pem
HTTPS_KEY_FILE=../certs/namelessnote-local-key.pem
```

Con eso el backend levantara por `https://localhost:4000` o por tu IP local en el mismo puerto, si el certificado existe.

### 5. Habilitar HTTPS en frontend
En `frontend/.env`:
```dotenv
VITE_API_BASE_URL=https://192.168.1.235:4000
DEV_HTTPS=true
DEV_HTTPS_CERT_FILE=../certs/namelessnote-local.pem
DEV_HTTPS_KEY_FILE=../certs/namelessnote-local-key.pem
```

Nota: `VITE_API_BASE_URL` no debe incluir `/api`, porque el frontend ya agrega ese prefijo en sus llamadas.

Si levantas el proyecto con `npm run dev` desde la raiz, recuerda que entra `docker-compose.dev.yml`. Ese archivo tambien debe montar `certs/` y activar HTTPS en frontend y backend. Si cambias certificados o variables, reinicia los contenedores con:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### 6. Restaurar el certificado en otra maquina o despues de formatear
Los archivos `certs/namelessnote-local.pem` y `certs/namelessnote-local-key.pem` por si solos no bastan si la CA local no esta instalada.

Debes hacer una de estas dos cosas:

1. Volver a ejecutar `mkcert -install` y generar de nuevo el certificado con `mkcert`.
2. Restaurar tambien la CA local de `mkcert` e instalarla en el sistema.

La opcion recomendada es la primera: regenerar el certificado en cada maquina.

### 7. Confianza en otros dispositivos de la red
Si abres el sitio desde otro telefono o laptop en tu Wi-Fi, ese dispositivo tambien debe confiar en la CA de `mkcert`. Si no, vera advertencias de seguridad aunque el certificado exista.

## Docker
```bash
docker compose up -d --build
```
