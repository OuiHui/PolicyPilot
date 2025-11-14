-- Schema objects are idempotent so the script can be re-run safely.

create extension if not exists "pgcrypto";
create extension if not exists "citext";

do $$
begin
	if not exists (select 1 from pg_type where typname = 'case_status') then
		create type case_status as enum ('draft', 'submitted', 'in_review', 'resolved', 'closed');
	end if;
end$$;

create table if not exists insurance_plans (
	plan_id uuid primary key default gen_random_uuid(),
	plan_name text not null,
	insurance_name text not null,
	policy_summary text,
	policy_metadata jsonb not null default '{}'::jsonb,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists plan_policy_documents (
	document_id uuid primary key default gen_random_uuid(),
	plan_id uuid not null references insurance_plans(plan_id) on delete cascade,
	document_name text not null,
	document_type text,
	document_url text,
	storage_path text,
	uploaded_at timestamptz not null default now()
);

create index if not exists idx_plan_policy_documents_plan_id
	on plan_policy_documents(plan_id);

create table if not exists users (
	email citext primary key,
	full_name text not null,
	date_of_birth date not null,
	insurance_plan_id uuid references insurance_plans(plan_id) on delete set null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists idx_users_insurance_plan_id on users(insurance_plan_id);

create table if not exists insurance_cases (
	case_id uuid primary key default gen_random_uuid(),
	patient_email citext not null references users(email) on delete cascade,
	insurance_plan_id uuid not null references insurance_plans(plan_id) on delete cascade,
	case_title text,
	appeal_reason text,
	provider_notes text,
	status case_status not null default 'draft',
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists idx_cases_patient_email on insurance_cases(patient_email);
create index if not exists idx_cases_plan_id on insurance_cases(insurance_plan_id);

create table if not exists case_documents (
	document_id uuid primary key default gen_random_uuid(),
	case_id uuid not null references insurance_cases(case_id) on delete cascade,
	document_name text not null,
	document_type text,
	document_url text,
	storage_path text,
	uploaded_at timestamptz not null default now()
);

create index if not exists idx_case_documents_case_id on case_documents(case_id);

create or replace function set_updated_at()
returns trigger as $$
begin
	new.updated_at = now();
	return new;
end;
$$ language plpgsql;

drop trigger if exists trg_insurance_plans_updated on insurance_plans;
create trigger trg_insurance_plans_updated
before update on insurance_plans
for each row execute function set_updated_at();

drop trigger if exists trg_users_updated on users;
create trigger trg_users_updated
before update on users
for each row execute function set_updated_at();

drop trigger if exists trg_cases_updated on insurance_cases;
create trigger trg_cases_updated
before update on insurance_cases
for each row execute function set_updated_at();

create or replace view plan_member_snapshot as
select
	ip.plan_id,
	ip.plan_name,
	ip.insurance_name,
	ip.policy_summary,
	coalesce(jsonb_agg(distinct jsonb_build_object(
		'email', u.email::text,
		'full_name', u.full_name,
		'date_of_birth', u.date_of_birth
	)) filter (where u.email is not null), '[]'::jsonb) as members,
	coalesce(jsonb_agg(distinct jsonb_build_object(
		'case_id', c.case_id,
		'patient_email', c.patient_email::text,
		'status', c.status,
		'created_at', c.created_at
	)) filter (where c.case_id is not null), '[]'::jsonb) as associated_cases,
	coalesce(jsonb_agg(distinct jsonb_build_object(
		'document_id', ppd.document_id,
		'document_name', ppd.document_name,
		'document_type', ppd.document_type,
		'document_url', ppd.document_url
	)) filter (where ppd.document_id is not null), '[]'::jsonb) as policy_documents
from insurance_plans ip
left join users u on u.insurance_plan_id = ip.plan_id
left join insurance_cases c on c.insurance_plan_id = ip.plan_id
left join plan_policy_documents ppd on ppd.plan_id = ip.plan_id
group by ip.plan_id;
