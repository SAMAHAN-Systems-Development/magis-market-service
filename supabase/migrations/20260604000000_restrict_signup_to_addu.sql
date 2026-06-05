create or replace function public.restrict_signup_to_addu(event jsonb)
returns jsonb
language plpgsql
as $$
declare
  email text;
begin
  email := lower(coalesce(event->'user'->>'email', ''));

  if email = '' or right(email, length('@addu.edu.ph')) <> '@addu.edu.ph' then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Only ADDU email addresses are allowed.'
      )
    );
  end if;

  return '{}'::jsonb;
end;
$$;

grant usage on schema public to supabase_auth_admin;

grant execute
  on function public.restrict_signup_to_addu(jsonb)
  to supabase_auth_admin;

revoke execute
  on function public.restrict_signup_to_addu(jsonb)
  from authenticated, anon, public;
