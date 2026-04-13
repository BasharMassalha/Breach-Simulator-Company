begin;

create table if not exists employee_profiles (
  user_id uuid primary key,
  full_name text not null,
  title text,
  department text,
  phone text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint employee_profiles_user_fk
    foreign key (user_id) references users(id)
    on delete cascade
);

create index if not exists employee_profiles_department_idx on employee_profiles (department);

drop trigger if exists employee_profiles_set_updated_at on employee_profiles;
create trigger employee_profiles_set_updated_at
before update on employee_profiles
for each row
execute function set_updated_at();

commit;
