-- Keep the SECURITY DEFINER authorization helper outside exposed API schemas.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('admin','owner')
  );
$$;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and (select auth.uid()) is not null
     and not private.is_admin() then
    raise exception 'Only store administrators can change account roles';
  end if;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.prevent_profile_role_change() from public, anon, authenticated;

drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin" on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select private.is_admin()));
drop policy if exists "admins update profiles" on public.profiles;
create policy "admins update profiles" on public.profiles for update to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
drop policy if exists "admins delete profiles" on public.profiles;
create policy "admins delete profiles" on public.profiles for delete to authenticated
using ((select private.is_admin()));

drop policy if exists "admins manage products" on public.products;
create policy "admins manage products" on public.products for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
drop policy if exists "admins manage categories" on public.categories;
create policy "admins manage categories" on public.categories for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
drop policy if exists "admins manage hero slides" on public.hero_slides;
create policy "admins manage hero slides" on public.hero_slides for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
drop policy if exists "admins manage coupons" on public.coupons;
create policy "admins manage coupons" on public.coupons for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
drop policy if exists "admins manage store settings" on public.store_settings;
create policy "admins manage store settings" on public.store_settings for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
drop policy if exists "admins read all orders" on public.orders;
create policy "admins read all orders" on public.orders for select to authenticated
using ((select private.is_admin()));
drop policy if exists "admins update all orders" on public.orders;
create policy "admins update all orders" on public.orders for update to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
drop policy if exists "admins delete orders" on public.orders;
create policy "admins delete orders" on public.orders for delete to authenticated
using ((select private.is_admin()));
drop policy if exists "read own order items or admin" on public.order_items;
create policy "read own order items or admin" on public.order_items for select to authenticated
using (exists (
  select 1 from public.orders o where o.id = order_items.order_id
    and (o.user_id = (select auth.uid()) or (select private.is_admin()))
));
drop policy if exists "admins manage order items" on public.order_items;
create policy "admins manage order items" on public.order_items for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

drop function if exists public.is_admin();
