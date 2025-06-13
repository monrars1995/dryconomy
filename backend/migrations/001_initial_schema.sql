-- Enable UUID extension
create extension if not exists "uuid-ossp" with schema extensions;

-- Create profiles table
create table if not exists public.profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'user'::text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  primary key (id)
);

-- Create calculation_variables table
create table if not exists public.calculation_variables (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  value double precision not null,
  unit text not null,
  category text not null,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  updated_by uuid references auth.users(id)
);

-- Create leads table
create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text,
  company text,
  state text,
  created_at timestamp with time zone default now()
);

-- Create simulations table
create table if not exists public.simulations (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references public.leads(id) on delete cascade,
  inputs jsonb not null,
  results jsonb not null,
  created_at timestamp with time zone default now()
);

-- Create webhook_configs table
create table if not exists public.webhook_configs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  url text not null,
  is_active boolean default true,
  events text[] not null,
  headers jsonb,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create webhook_logs table
create table if not exists public.webhook_logs (
  id uuid primary key default uuid_generate_v4(),
  webhook_id uuid references public.webhook_configs(id) on delete cascade,
  event_type text not null,
  payload jsonb not null,
  response_status integer,
  response_body text,
  error_message text,
  created_at timestamp with time zone default now()
);

-- Create indexes
create index if not exists idx_calculation_variables_category on public.calculation_variables (category);
create index if not exists idx_leads_created_at on public.leads (created_at);
create index if not exists idx_leads_email on public.leads (email);
create index if not exists idx_simulations_lead_id on public.simulations (lead_id);
create index if not exists idx_webhook_logs_webhook_id on public.webhook_logs (webhook_id);
create index if not exists idx_webhook_logs_created_at on public.webhook_logs (created_at);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.calculation_variables enable row level security;
alter table public.leads enable row level security;
alter table public.simulations enable row level security;
alter table public.webhook_configs enable row level security;
alter table public.webhook_logs enable row level security;

-- Create RLS policies for profiles
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using (true);

create policy "Users can update their own profile."
  on public.profiles for update
  using (auth.uid() = id);

-- Create RLS policies for calculation_variables
create policy "Calculation variables are viewable by everyone."
  on public.calculation_variables for select
  using (true);

create policy "Admins can manage calculation variables"
  on public.calculation_variables
  using (exists (
    select 1 from public.profiles 
    where id = auth.uid() and role = 'admin'
  ));

-- Create RLS policies for leads
create policy "Leads are viewable by admins and viewers"
  on public.leads for select
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('admin', 'viewer')
    )
  );

create policy "Admins can manage leads"
  on public.leads
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create RLS policies for simulations
create policy "Simulations are viewable by admins and viewers"
  on public.simulations for select
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('admin', 'viewer')
    )
  );

-- Create RLS policies for webhook_configs
create policy "Webhook configs are viewable by admins"
  on public.webhook_configs for select
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can manage webhook configs"
  on public.webhook_configs
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create RLS policies for webhook_logs
create policy "Webhook logs are viewable by admins"
  on public.webhook_logs for select
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create a function to handle updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Create triggers for updated_at
create or replace trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create or replace trigger handle_calculation_variables_updated_at
  before update on public.calculation_variables
  for each row execute procedure public.handle_updated_at();

create or replace trigger handle_webhook_configs_updated_at
  before update on public.webhook_configs
  for each row execute procedure public.handle_updated_at();

-- Create a function to automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'user' -- Default role
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user sign ups
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
