# Junior Capstone

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev:client` to start the development client.
Run `npm run server` to start the development server on a different terminal.

Run `python -m venv venv` to create a virtual environment.
Run `pip install -r requirements.txt` to install the python dependencies.

For windows, use `.\venv\Scripts\activate` to activate the virtual environment.
For mac, use `source venv/bin/activate` to activate the virtual environment.

## Supabase & PostgreSQL

1. Copy `.env.example` to `.env.local` and fill in the Supabase values:

  ```pwsh
  Copy-Item .env.example .env.local
  ```

  - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` come from your Supabase project's API settings (Project Settings ➜ API).
  - `DATABASE_URL` is used only for CLI/database migrations and should never be exposed to the browser.

2. Apply the database schema using the provided Supabase connection string:

  ```pwsh
  psql "$env:DATABASE_URL" -f supabase/schema.sql
  ```

  The script creates:
  - `insurance_plans` with related policy metadata/documents
  - `users` keyed by email (includes DOB and plan membership)
  - `insurance_cases` plus `case_documents` for provider uploads
  - A convenience view `plan_member_snapshot` that surfaces members, cases, and policy docs per plan

3. Smoke-test the schema directly from `psql` (helps confirm migrations on Supabase):

  ```pwsh
  psql "$env:DATABASE_URL" -c "\dt"
  psql "$env:DATABASE_URL" -c "SELECT plan_name, insurance_name FROM insurance_plans LIMIT 5;"
  psql "$env:DATABASE_URL" -c "SELECT * FROM plan_member_snapshot LIMIT 5;"
  ```

  You should see the new tables listed, and the final query should return one row per plan with aggregated members/cases. Add seed data with regular `INSERT` commands to exercise the relationships before pointing the UI at Supabase.

3. Use the shared Supabase client in `src/utils/supabase/client.ts` to read/write data inside the app:

  ```ts
  import { supabase } from '@/utils/supabase/client';

  const { data, error } = await supabase.from('insurance_cases').select('*');
  ```

  Because the client relies on `import.meta.env`, remember to restart the dev server whenever you add or change environment variables.
  