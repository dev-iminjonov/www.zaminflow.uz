# ZaminFlow production deployment

## Current state

The application is a Next.js App Router project with server rendering and API routes, plus a FastAPI service backed by PostgreSQL/PostGIS. The frontend can run on Cloudflare Workers using the Cloudflare-recommended `vinext` adapter. Supabase provides Auth, Postgres, and private document storage. The API remains a separate Python service: it uses async SQLAlchemy, which is not supported by the Cloudflare Python Workers/Hyperdrive path in this repository.

The Cloudflare zone and Supabase project have been created. Supabase Auth URLs are configured. The SQL migration is committed locally but has **not** been applied. There is no deployed Worker or API service yet. Cloudflare's DNS scan found no records, and aHOST showed DNS hosting disabled and no email/hosting service. Recheck at aHOST before changing nameservers if any mail or other DNS service was added since that scan.

## Deploy sequence

### 1. Apply the Supabase schema

From the repository root, in a terminal where you have installed Node.js 22 and pnpm:

```powershell
pnpm dlx supabase login
pnpm dlx supabase link --project-ref swfjmikzmpkahvclgvaw
pnpm dlx supabase db push --yes
```

Run `supabase login` locally and do not paste its access token into chat or commit it. The linked project uses the Mumbai region. The migration enables RLS on the application tables, provisions a public profile and organization when a permitted Supabase Auth account signs up, and creates the private `kyb-documents` bucket. Review the SQL in `supabase/migrations` before applying it to any database with existing data.

In Supabase Auth > URL Configuration, the Site URL is `https://zaminflow.uz`; redirect patterns for apex, `www`, workers.dev and local development are configured. Keep email confirmation enabled for public signup. Configure an SMTP provider before relying on production email verification or password reset; Supabase's default mail delivery is for testing and has tight limits.

### 2. Deploy the FastAPI service

Deploy `backend/` as a persistent Python 3.12 Docker service on a container host or VM. No API host has been purchased or configured for this project. Provide these values as server-side secrets/configuration:

- `DATABASE_URL`: Supabase Postgres connection string, preferably the session pooler for a long-running service; use the SQLAlchemy `postgresql+asyncpg://` scheme.
- `SUPABASE_URL=https://swfjmikzmpkahvclgvaw.supabase.co`
- `JWT_SECRET_KEY`, `CSRF_SECRET`, `QR_HMAC_SECRET`, `BANK_WEBHOOK_HMAC_SECRET`: independent random secrets, at least 32 characters each.
- `APP_BASE_URL=https://zaminflow.uz`
- SMTP credentials if email flows are enabled.

Keep database credentials and signing keys server-side. Never put a Supabase `service_role` key in Cloudflare variables or frontend code. Configure the API host's health check to `/health` and allow HTTPS requests from the public app. The backend currently uses its database connection for application data and applies tenant/role checks in API code; Supabase RLS also protects direct client access.

### 3. Deploy the Worker from the repository

In Cloudflare Workers & Pages, connect the GitHub repository `dev-iminjonov/www.zaminflow.uz` and select the production branch. Limit the GitHub app to this repository if the permission screen offers that choice. The existing Cloudflare connect button did not complete; GitHub is not yet connected.

Create a Worker using `frontend/` as the root directory. Use Node.js 22.12 or newer and pnpm. Configure the build/deploy commands as:

Set the project path to `/frontend` and use:

```text
Build command: pnpm run build:worker
Deploy command: pnpm exec vinext-cloudflare deploy --skip-build
```

Add these as **Build variables** so Vite embeds them in the browser bundle (both are public browser configuration):

```text
NEXT_PUBLIC_SUPABASE_URL=https://swfjmikzmpkahvclgvaw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase publishable/anon key>
BACKEND_URL=https://<your-api-host>
NEXT_PUBLIC_USE_MOCK_DATA=false
```

Never add a `service_role` key. Deploy first and verify the `*.workers.dev` URL before attaching the custom hostname.

Set `BACKEND_URL` separately under Worker **Runtime variables** after the FastAPI service has a public HTTPS hostname. Use only the origin (for example `https://api.example.com`); the route handler appends `/api/v1/...` itself.

For a local Worker build/deploy, use `cd frontend`, `pnpm run build:worker`, and `pnpm run deploy:worker`. The `deploy:worker` command publishes to the currently authenticated Cloudflare account, so confirm the account and selected Worker before running it.

### 4. Activate the domain after the Worker is live

Cloudflare assigned these nameservers:

```text
nora.ns.cloudflare.com
stan.ns.cloudflare.com
```

At aHOST: Client Area > Domains > `zaminflow.uz` > Nameservers > select custom nameservers > enter both names above > save. Disable DNSSEC at the registrar first if it is enabled. Do not use Cloudflare's “I updated my nameservers” button until the registrar change is saved. Wait for Cloudflare to report the zone Active.

Once active, add both `zaminflow.uz` and `www.zaminflow.uz` as Worker custom domains. Set `www` to redirect permanently (301) to `https://zaminflow.uz`. In Cloudflare SSL/TLS, select **Full (strict)**, enable **Always Use HTTPS** and **Automatic HTTPS Rewrites**. Never use Flexible SSL.

Verify propagation:

```powershell
nslookup -type=ns zaminflow.uz
nslookup zaminflow.uz
nslookup www.zaminflow.uz
```

The first command should eventually show the two Cloudflare nameservers. DNS changes may take up to 48 hours to settle globally.

## Verification and known limits

After all services are deployed, test the workers.dev URL, then the custom domain: direct refreshes on nested routes, UZ/RU/EN switching, signup and email confirmation, login/logout, password reset, API reads/writes, private document access, and cross-tenant access denial. Test both logged-out and signed-in sessions; inspect browser console/network errors and run Lighthouse on the public URL. Do not create real payment or bank webhook data as a smoke test.

The Worker build and TypeScript check can verify compilation only. They do not prove that hosted Auth, the API database, email delivery, or every dashboard workflow is functional. Several feature stores still use browser `localStorage` and mock/sample data; those workflows are not durable across devices and have not yet been migrated to API persistence. SMS login also requires a Supabase phone identity and an SMS provider. Do not claim full production feature parity until those flows are implemented and tested.

Supabase Free can pause projects after a week of low database activity and does not include downloadable automatic database backups. It therefore cannot guarantee “very long time” availability by itself. For a public service people depend on, upgrade Supabase to a no-auto-pause paid plan, configure backups, and keep the API on a host with an always-on service. These choices can incur monthly charges and have not been made on the user's behalf.

## Rollback and maintenance

- Cloudflare Workers keeps prior deployments; use the Worker deployment history to roll back to the previous known-good version. Revert the corresponding Git commit as well.
- Database migrations are forward-only by default. Back up data before schema changes; add a new timestamped SQL file under `supabase/migrations`, then apply with `pnpm dlx supabase db push`.
- Enable a paid backup/PITR option before production data is important. Store a separate encrypted backup outside the project and practice restoring it.
- Rotate Supabase Auth signing keys only using Supabase's supported key rotation process; rotate database passwords and application secrets in the API host, then restart/redeploy the API. Rotate the public anon key only through Supabase and update Cloudflare build/runtime variables.
- Keep `.env` local and untracked. `.env.example` contains variable names, not credentials.
