# Deployment — GitHub → Amplify (frontend) + Render (API)

Repo: https://github.com/Raj-code-ai/Bu-Papers-Ready_

## 1. MongoDB Atlas

1. Create free cluster + DB user.
2. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`).

   Render uses **changing outbound IPs**. Whitelisting only your home/office IP causes:

   `Could not connect to any servers in your MongoDB Atlas cluster... IP that isn't whitelisted`

   After updating Network Access, **Restart** (or redeploy) the Render API service.
3. Copy connection string → use as `MONGODB_URI` on Render (database name `arms`).

## 2. Render (backend)

1. New **Web Service** → connect this GitHub repo.
2. Settings:
   - **Root Directory:** `backend`
   - **Build:** `npm install`
   - **Start:** `npm start`
   - Health: `/api/v1/health`
3. Set environment variables (see `.env.example` + secrets below). **Do not** set `PORT`.
4. Required secrets:
   - `MONGODB_URI`, `MONGODB_DB_NAME=arms`
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CSRF_SECRET` (unique, long)
   - `CLOUDINARY_*`, `STORAGE_PROVIDER=cloudinary`
   - `NODE_ENV=production`, `COOKIE_SECURE=true`, `SWAGGER_ENABLED=false`
5. After Vercel is live, set CORS to your **real** frontend URL(s) (no trailing slash).

Current production example:

```env
FRONTEND_URL=https://bu-papers-ready-jlgx.vercel.app
CORS_ORIGINS=https://bu-papers-ready-jlgx.vercel.app,https://*.vercel.app
API_BASE_URL=https://bu-papers-ready.onrender.com
```

`https://*.vercel.app` allows Vercel production + preview domains.

Optional: `render.yaml` at repo root for Blueprint deploys.

## 3. AWS Amplify (frontend)

Region: `ap-southeast-2`.  
Repository: **https://github.com/Raj-code-ai/AWS-BU-**, branch **main**.

Create a new Amplify app and let it use `amplify.yml` from the repository. Do not type a separate build command. That file installs `frontend/`, runs the Vite build, and publishes the `dist` folder at the repository root.

In the Amplify app, set this **before** the build. Vite bakes it into the bundle:

```env
VITE_API_BASE_URL=https://YOUR-API.onrender.com/api/v1
```

Hosting → Rewrites and redirects. Add the rule from `customRules.json` so `/login` and `/admin` load:

| Source | Target | Type |
|--------|--------|------|
| `/<*>` | `/index.html` | `404-200` |

On the API, allow the Amplify domain (no trailing slash):

```env
FRONTEND_URL=https://main.dh014mymg99rf.amplifyapp.com
CORS_ORIGINS=https://main.dh014mymg99rf.amplifyapp.com,https://*.amplifyapp.com
```

`https://*.amplifyapp.com` covers the default Amplify branch URLs. Redeploy Amplify after any `VITE_*` change.

## 4. Vercel (frontend, optional)

1. Import the same GitHub repo.
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework:** Vite
   - **Build:** `npm run build`
   - **Output:** `dist`
3. Environment:
   - `VITE_API_BASE_URL=https://bu-papers-ready.onrender.com/api/v1`
4. `frontend/vercel.json` rewrites all routes to `index.html` (required for `/login`, `/admin`, etc.).

Live frontend example: `https://bu-papers-ready-jlgx.vercel.app`

Redeploy Vercel after changing `VITE_*` (build-time vars).

## 5. Cloudinary

Settings → Security → enable **Allow delivery of PDF and ZIP files**.

## 6. First login / seed

On first DB connect, bootstrap Super Admin may be created from env:

- `BOOTSTRAP_SUPERADMIN_EMAIL` / `BOOTSTRAP_SUPERADMIN_PASSWORD`

Or run seed scripts against Atlas from a trusted machine:

```bash
cd backend
# point .env at Atlas
npm run seed:superadmin -- --reset
npm run seed:admin -- --reset
npm run seed:defaults
```

Default local bootstrap (change in production):

- Super Admin: `superadmin@arms.local` / `ChangeMe!SuperAdmin1`
- Admin: `admin@arms.local` / `ChangeMe!Admin1`

## 7. Verify

- `GET https://YOUR-API.onrender.com/api/v1/health` → `status: ok`, DB connected
- Open the Amplify site → `/login` loads (not an Amplify 404)
- Login works (CORS + API URL correct)
- Upload PDF → view/download works (Cloudinary PDF delivery enabled)

## Security

Never commit `.env`. Rotate any secrets pasted in chat before production handoff.
