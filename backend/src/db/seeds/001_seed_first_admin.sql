-- Seed the first admin (manual, one-time).
-- 1) Generate a bcrypt hash with:
--    PASSWORD="YourPasswordHere" npm run db:hash
-- 2) Replace :ADMIN_EMAIL and :ADMIN_PASSWORD_HASH below.
-- 3) Run this file in pgAdmin Query Tool (recommended).

begin;

with new_user as (
  insert into users (email, password_hash, role, is_active)
  values (
    'admin@breach.local',
    '$2b$12$4UWQHIRpxbODAJ9n9Jz7H.PSMEFV0DjtQeN56kuISsbEBGMDR23f2',
    'admin',
    true
  )
  returning id
)
insert into employee_profiles (user_id, full_name, title, department, phone, location)
select
  id,
  'First Admin',
  'System Administrator',
  'IT',
  null,
  null
from new_user;

commit;

