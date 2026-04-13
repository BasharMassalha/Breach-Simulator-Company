begin;

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid,
  name text not null,
  category text not null default 'general',
  sensitivity text not null default 'internal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint documents_owner_fk
    foreign key (owner_user_id) references users(id)
    on delete set null,
  constraint documents_sensitivity_check check (sensitivity in ('public', 'internal', 'confidential'))
);

create index if not exists documents_owner_user_id_idx on documents (owner_user_id);
create index if not exists documents_sensitivity_idx on documents (sensitivity);
create index if not exists documents_category_idx on documents (category);
create index if not exists documents_created_at_idx on documents (created_at desc);

drop trigger if exists documents_set_updated_at on documents;
create trigger documents_set_updated_at
before update on documents
for each row
execute function set_updated_at();

commit;
