# TAARAA — Step 1 (Auth + Database)

## Setup (run these in order)

```bash
# 1. Install dependencies
npm install

# 2. Create your env file, then paste your DATABASE_URL into it
cp .env.example .env
#    -> open .env and set DATABASE_URL (Neon / Supabase / local Postgres)

# 3. Generate the auth secret (writes AUTH_SECRET into .env)
npx auth secret

# 4. Create the database tables
npx prisma migrate dev --name init
npx prisma generate

# 5. Run
npm run dev
```

Open http://localhost:3000

## Verify the auth loop
1. Visit /dashboard while logged out -> bounced to /login
2. Go to /signup, register (password: min 8 chars, 1 uppercase, 1 number e.g. Taaraa123)
   -> lands on dashboard showing your name + user id
3. Click "Log out" -> back to /login
4. `npx prisma studio` -> users table -> passwordHash is a scrambled $2... string

If a step fails, note the exact error message.
