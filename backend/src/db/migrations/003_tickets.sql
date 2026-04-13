begin;

create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null,
  assigned_to uuid,
  status text not null default 'open',
  priority text not null default 'medium',
  subject text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint tickets_created_by_fk
    foreign key (created_by) references users(id)
    on delete restrict,
  constraint tickets_assigned_to_fk
    foreign key (assigned_to) references users(id)
    on delete set null,
  constraint tickets_status_check check (status in ('open', 'in_progress', 'closed')),
  constraint tickets_priority_check check (priority in ('low', 'medium', 'high'))
);

create index if not exists tickets_created_by_idx on tickets (created_by);
create index if not exists tickets_assigned_to_idx on tickets (assigned_to);
create index if not exists tickets_status_idx on tickets (status);
create index if not exists tickets_priority_idx on tickets (priority);
create index if not exists tickets_created_at_idx on tickets (created_at desc);

drop trigger if exists tickets_set_updated_at on tickets;
create trigger tickets_set_updated_at
before update on tickets
for each row
execute function set_updated_at();

commit;
