begin;

-- Extensions we rely on:
-- - pgcrypto: UUID generation via gen_random_uuid()
-- - citext: case-insensitive email uniqueness
create extension if not exists pgcrypto;
create extension if not exists citext;

-- Track applied migrations (simple, reliable, no ORM).
create table if not exists schema_migrations (
  id bigserial primary key,
  filename text not null unique,
  applied_at timestamptz not null default now()
);

-- Standard updated_at trigger helper.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

commit;
