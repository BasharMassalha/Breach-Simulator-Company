begin;

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  ip text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint audit_logs_actor_fk
    foreign key (actor_user_id) references users(id)
    on delete set null
);

create index if not exists audit_logs_actor_user_id_idx on audit_logs (actor_user_id);
create index if not exists audit_logs_action_idx on audit_logs (action);
create index if not exists audit_logs_entity_idx on audit_logs (entity_type, entity_id);
create index if not exists audit_logs_created_at_idx on audit_logs (created_at desc);
create index if not exists audit_logs_metadata_gin_idx on audit_logs using gin (metadata);

drop trigger if exists audit_logs_set_updated_at on audit_logs;
create trigger audit_logs_set_updated_at
before update on audit_logs
for each row
execute function set_updated_at();

commit;
