-- Local/demo schema for a future Postgres (Supabase) deployment.
-- The running app does not connect to this database unless a verified client is added.
-- Row Level Security is enabled and no anon policies are granted: the browser must not use a service-role key.

create table if not exists materials (
  id text primary key,
  name text not null,
  role text not null check (role in ('api','filler','binder','disintegrant','glidant','lubricant','wetting','capsule_shell','other')),
  created_at timestamptz not null default now()
);

create table if not exists material_lots (
  id text primary key,
  material_id text not null references materials(id),
  batch_no text not null,
  mass_g numeric not null check (mass_g >= 0),
  unit text not null default 'g' check (unit in ('mg','g','kg','ml')),
  quality_status text not null check (quality_status in ('quarantine','released','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists formulations (
  id text primary key,
  name text not null,
  route text not null check (route in ('direct_blend','wet_granulation')),
  capsule_size text not null,
  target_capsules integer not null check (target_capsules > 0),
  training_example boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists formulation_components (
  id text primary key,
  formulation_id text not null references formulations(id) on delete cascade,
  material_id text not null references materials(id),
  role text not null,
  planned_mg_per_capsule numeric not null check (planned_mg_per_capsule >= 0),
  unique (formulation_id, id)
);

create table if not exists equipment_models (
  id text primary key,
  manufacturer text not null,
  model_name text not null,
  category text not null,
  spec_status text not null check (spec_status in ('verified','typical_class','training_stub')),
  source_url text,
  checked_on date,
  unverified_notes text
);

create table if not exists equipment_instances (
  id text primary key,
  model_id text not null references equipment_models(id),
  zone text not null
);

create table if not exists batches (
  id text primary key,
  formulation_id text not null references formulations(id),
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists batch_components (
  id text primary key,
  batch_id text not null references batches(id) on delete cascade,
  material_lot_id text references material_lots(id),
  role text not null,
  mass_g numeric not null check (mass_g >= 0)
);

create table if not exists process_operations (
  id text primary key,
  batch_id text not null references batches(id) on delete cascade,
  operation_code text not null,
  status text not null,
  started_at timestamptz,
  finished_at timestamptz
);

create table if not exists operation_parameters (
  id text primary key,
  operation_id text not null references process_operations(id) on delete cascade,
  name text not null,
  value_num numeric,
  unit text
);

create table if not exists material_transfers (
  id text primary key,
  batch_id text not null references batches(id) on delete cascade,
  from_lot_id text,
  to_lot_id text,
  mass_g numeric not null check (mass_g > 0),
  created_at timestamptz not null default now()
);

create table if not exists qc_runs (
  id text primary key,
  batch_id text not null references batches(id) on delete cascade,
  method text not null,
  model_data boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists qc_results (
  id text primary key,
  run_id text not null references qc_runs(id) on delete cascade,
  name text not null,
  value_text text,
  unit text,
  conclusion text not null check (conclusion in ('pass','fail','informational'))
);

create table if not exists audit_events (
  id text primary key,
  batch_id text references batches(id),
  action text not null,
  summary text not null,
  created_at timestamptz not null default now()
);

create table if not exists reference_sources (
  id text primary key,
  citation text not null,
  url text,
  checked_on date
);

alter table materials enable row level security;
alter table material_lots enable row level security;
alter table formulations enable row level security;
alter table formulation_components enable row level security;
alter table equipment_models enable row level security;
alter table equipment_instances enable row level security;
alter table batches enable row level security;
alter table batch_components enable row level security;
alter table process_operations enable row level security;
alter table operation_parameters enable row level security;
alter table material_transfers enable row level security;
alter table qc_runs enable row level security;
alter table qc_results enable row level security;
alter table audit_events enable row level security;
alter table reference_sources enable row level security;
