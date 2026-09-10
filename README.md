# Adyoolau — Ebook Platform (MERN Stack)

A full-stack ebook website: browse and search a catalog, buy books via Stripe,
read them in the browser (PDF/EPUB), download them, and manage everything
through an admin panel.

## Stack

- **Frontend:** React (Vite) + Tailwind CSS + React Router
- **Backend:** Node.js + Express
- **Database:** MongoDB (Atlas)
- **Auth:** JWT
- **Payments:** Stripe Checkout
- **File storage:** S3-compatible storage (AWS S3, DigitalOcean Spaces, etc.)
- **Reading:** react-pdf for PDFs, epub.js for EPUBs

## Project structure

```
adyoolau/
├── backend/          Express API
│   ├── config/        MongoDB connection
│   ├── controllers/   Route logic (auth, books, orders)
│   ├── middleware/     Auth (JWT) + file upload (S3)
│   ├── models/         User, Book, Order
│   ├── routes/          Express routers
│   ├── scripts/        createAdmin.js — promote/create an admin user
│   └── server.js
└── frontend/         React app
    └── src/
        ├── api/         Axios instance
        ├── components/  Navbar, Footer, BookCard, route guards
        ├── context/     Auth + Cart state
        ├── pages/       Home, Catalog, Book detail, Cart, Reader, Admin...
        └── assets/      Your logo
```

## 1. Prerequisites

- Node.js 18+
- A MongoDB Atlas connection string (you said you already have one)
- A Stripe account (test mode is fine to start): https://dashboard.stripe.com
- An S3-compatible bucket (AWS S3, DigitalOcean Spaces, Cloudflare R2, Backblaze B2, etc.)
  - Create a bucket, set it to allow public read on objects (or use CloudFront/CDN in front of it)
  - Create an access key + secret with read/write access to that bucket

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

- `MONGO_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` — any long random string
- `STRIPE_SECRET_KEY` — from the Stripe dashboard (Developers → API keys)
- `STRIPE_WEBHOOK_SECRET` — see step 4 below
- `S3_*` — your bucket name, region, access key, secret key
  - Leave `S3_ENDPOINT` blank for real AWS S3; set it for other providers (e.g. `https://nyc3.digitaloceanspaces.com`)
  - `S3_PUBLIC_URL_BASE` is the base URL your bucket's objects are served from (used for cover images, which are public; the actual book files are served via short-lived signed URLs regardless, so they stay protected)

Run the server:

```bash
npm run dev
```

The API runs on `http://localhost:5000` by default.

### Create your first admin user

After registering a normal account through the website (or directly):

```bash
cd backend
node scripts/createAdmin.js you@example.com "Your Name" "SomeStrongPassword123"
```

If the email already exists it just promotes that account to admin; otherwise it creates a new admin account.

## 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

Set `VITE_API_URL` to your backend's API URL (default `http://localhost:5000/api`).

Run it:

```bash
npm run dev
```

The site runs on `http://localhost:5173`.

## 4. Stripe webhook (required for orders to complete)

Stripe needs to notify your backend when a payment succeeds so the book gets
added to the buyer's library.

**Local development:** use the Stripe CLI:

```bash
stripe login
stripe listen --forward-to localhost:5000/api/orders/webhook
```

This prints a webhook signing secret starting with `whsec_...` — put that in
your backend `.env` as `STRIPE_WEBHOOK_SECRET`.

**Production:** in the Stripe dashboard, go to Developers → Webhooks → Add
endpoint, point it at `https://your-api-domain.com/api/orders/webhook`,
subscribe to the `checkout.session.completed` event, and copy the signing
secret into your production `.env`.

## 5. How the pieces fit together

- **Browsing:** `GET /api/books` supports `search`, `category`, and pagination.
- **Buying:** the cart is client-side only; checkout creates a Stripe Checkout
  Session and a `pending` order, then redirects to Stripe. The webhook flips
  the order to `paid` and adds the purchased books to the user's `library`.
- **Free books:** bypass Stripe entirely — `POST /api/books/:id/claim` adds
  the book straight to the library.
- **Reading/downloading:** book files are never served publicly. Reading a
  book calls `GET /api/books/:id/access`, which checks the requester owns the
  book (or it's free) and returns a signed URL that expires after an hour.
- **Admin:** `/admin` in the frontend is only reachable by users with
  `role: "admin"`. Adding a book uploads the cover + file directly to your S3
  bucket via the backend.

## 6. Deployment notes

### Option A — Docker (run both services with one command)

This repo includes Dockerfiles for both services plus a `docker-compose.yml`
at the root.

1. Create `backend/.env` (copy from `.env.example` and fill in real values —
   same as step 2 above).
2. From the project root:

   ```bash
   VITE_API_URL=http://localhost:5000/api docker compose up --build
   ```

   - Backend API → `http://localhost:5000`
   - Frontend (built + served via nginx) → `http://localhost:5173`

   Note: `VITE_API_URL` is baked into the frontend at **build time** (that's
   how Vite works), so if you change it you need to rebuild:
   `docker compose up --build frontend`.

3. To deploy this pair to a VPS (a DigitalOcean droplet, EC2, etc.), install
   Docker + Docker Compose there, copy the repo over, set `backend/.env` with
   production values (including a `CLIENT_URL` pointing at your real domain),
   and run `docker compose up -d --build`. Put a reverse proxy (nginx,
   Caddy, or Traefik) in front of both containers for HTTPS.

### Option B — Separate managed hosts (no Docker)

- **Backend → Render:** a `render.yaml` blueprint is included at the project
  root. In the Render dashboard, "New → Blueprint", point it at this repo,
  and Render will provision the service from `render.yaml`. You'll be
  prompted to fill in the secret env vars (Mongo URI, JWT secret, Stripe
  keys, S3 credentials, `CLIENT_URL`) since those aren't committed to the
  repo. Railway or Fly.io work the same way if you prefer — just set the same
  env vars listed in `backend/.env.example` manually.
- **Frontend → Vercel:** a `vercel.json` is included in `frontend/`. Import
  the repo in Vercel, set the root directory to `frontend`, and add an
  environment variable `VITE_API_URL` pointing at your deployed backend
  (e.g. `https://adyoolau-api.onrender.com/api`). Netlify works the same way
  — just set the build command to `npm run build`, publish directory `dist`,
  and add a SPA redirect rule (`/* /index.html 200`).

Either way, once both are deployed:

1. Set the backend's `CLIENT_URL` to your live frontend URL (used for CORS
   and Stripe's success/cancel redirect URLs).
2. Add a **production** Stripe webhook pointed at
   `https://your-api-domain.com/api/orders/webhook` (see step 4) and put its
   signing secret in the backend's `STRIPE_WEBHOOK_SECRET`.
3. Point your S3 bucket's CORS settings to allow requests from your live
   frontend domain if you see CORS errors loading cover images.

## 7. Customization

- **Palette:** defined in `frontend/tailwind.config.js` under the `navy` and
  `gold` colors, matching your logo.
- **Logo:** `frontend/src/assets/logo.png` — swap the file to update it everywhere (navbar + favicon).
- **Fonts:** Fraunces (display/headings) + Inter (body), loaded in `index.html`.
