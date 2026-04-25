# EasyShop

EasyShop is a full-stack MERN inventory and sales management application with:
- `client` (Vite + React) for the frontend
- `server` (Node.js + Express + MongoDB) for the backend API

The project is configured to run in:
- local development (VS Code)
- production deployment (Vercel frontend + Render backend)

## Tech Stack

- Frontend: React, Vite, Axios, React Router, Tailwind CSS
- Backend: Node.js, Express, Mongoose, JWT, Helmet, CORS
- Database: MongoDB Atlas (recommended for production)

## Project Structure

```text
easyshop/
  client/        # Vite React frontend
  server/        # Express API backend
  render.yaml    # Optional Render blueprint for backend
  package.json   # Workspace helper scripts
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local or Atlas)

## Local Development Setup

### 1) Install dependencies

From project root:

```bash
npm run install:all
```

Or install separately:

```bash
cd server && npm install
cd ../client && npm install
```

### 2) Configure backend environment

Create `server/.env` from `server/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/easyshop
JWT_SECRET=replace-with-a-strong-random-secret
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3) Configure frontend environment

Create `client/.env` from `client/.env.example`:

```env
# Keep empty in local dev to use Vite proxy
VITE_API_URL=
```

### 4) Run the app

Open two terminals:

Backend:

```bash
npm run dev --prefix server
```

Frontend:

```bash
npm run dev --prefix client
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.

## Environment Variable Rules

### Backend (`server/.env`)

Required:
- `MONGO_URI`
- `JWT_SECRET`

Recommended:
- `PORT`
- `NODE_ENV`
- `CLIENT_URL` (comma-separated list of allowed frontend origins)

### Frontend (`client/.env`)

- Use only `VITE_*` variables.
- `VITE_API_URL` should be backend origin only (no trailing `/api`).
- Never place private secrets in frontend env variables. They are exposed in browser bundles.

## API URL Behavior (Local + Production)

The frontend axios client normalizes `VITE_API_URL` and all requests already include `/api/...`.

- Local: keep `VITE_API_URL` empty so Vite proxies `/api` to backend.
- Production: set `VITE_API_URL=https://<your-render-service>.onrender.com`

Do **not** use `/api` suffix in `VITE_API_URL`.

## CORS Configuration

Backend CORS supports:
- `CLIENT_URL` values from environment (single or comma-separated origins)
- local development origins (`http://localhost:5173`, `http://127.0.0.1:5173`)
- optional `VERCEL_URL` auto-allow for preview usage

If frontend and backend are connected correctly through env vars, CORS errors are avoided.

## Production Deployment

## 1) Deploy Backend on Render

1. Push your code to GitHub.
2. In Render, create a **Web Service** from repo.
3. Configure:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Node Version: 18+
4. Add backend environment variables in Render:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `CLIENT_URL=https://<your-vercel-domain>`
5. Deploy and copy your Render service URL.

> Optional: use `render.yaml` in this repo for blueprint-based setup.

## 2) Deploy Frontend on Vercel

1. In Vercel, import the same GitHub repository.
2. Configure:
   - Framework: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add frontend environment variable:
   - `VITE_API_URL=https://<your-render-service>.onrender.com`
4. Deploy.

## 3) Connect Both Correctly

1. Take Vercel app URL and set it in Render `CLIENT_URL`.
2. Take Render API URL and set it in Vercel `VITE_API_URL`.
3. Redeploy both services after env updates.
4. Verify:
   - `https://<render-url>/api/health` returns status JSON
   - frontend login and protected API calls work

## Security Checklist

- Keep all real secrets only in `server/.env` (local) or Render environment variables (production).
- Ensure `.env` files are ignored by git (`.gitignore` is configured).
- Rotate credentials immediately if any secret was ever committed to version control.
- Use strong JWT secret values (32+ random characters).

## Useful Scripts

From root:

- `npm run install:all` - install both client and server dependencies
- `npm run dev:server` - run backend in watch mode
- `npm run dev:client` - run frontend Vite dev server
- `npm run build:client` - production build for frontend
- `npm run start:server` - start backend in production mode

## Troubleshooting

- 401 errors: confirm token exists and backend `JWT_SECRET` is set.
- CORS errors: verify Render `CLIENT_URL` exactly matches your Vercel origin.
- Network errors on frontend: verify `VITE_API_URL` points to Render backend URL.
- Mongo connection errors: validate `MONGO_URI` and MongoDB network access rules.
