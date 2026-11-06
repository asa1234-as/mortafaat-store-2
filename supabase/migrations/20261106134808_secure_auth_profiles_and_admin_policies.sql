-- Secure Supabase Auth profiles and role-based policies for Mortafaat Store.
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('admin','owner')
  );
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,''), '@', 1)),
    coalesce(new.phone, new.raw_user_meta_data->>'phone'),
    'customer'
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        phone = coalesce(excluded.phone, public.profiles.phone),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and (select auth.uid()) is not null
     and not public.is_admin() then
    raise exception 'Only store administrators can change account roles';
  end if;
  return new;
end;
$$;
drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role before update on public.profiles
for each row execute function public.prevent_profile_role_change();

grant select, update on public.profiles to authenticated;
drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin" on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "profiles update own customer fields" on public.profiles;
create policy "profiles update own customer fields" on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()) and role = 'customer');
drop policy if exists "admins update profiles" on public.profiles;
create policy "admins update profiles" on public.profiles for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins delete profiles" on public.profiles;
create policy "admins delete profiles" on public.profiles for delete to authenticated
using ((select public.is_admin()));

grant select on public.products, public.categories, public.hero_slides, public.coupons, public.store_settings to anon, authenticated;
grant insert, update, delete on public.products, public.categories, public.hero_slides, public.coupons, public.store_settings to authenticated;
drop policy if exists "admins manage products" on public.products;
create policy "admins manage products" on public.products for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins manage categories" on public.categories;
create policy "admins manage categories" on public.categories for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins manage hero slides" on public.hero_slides;
create policy "admins manage hero slides" on public.hero_slides for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins manage coupons" on public.coupons;
create policy "admins manage coupons" on public.coupons for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins manage store settings" on public.store_settings;
create policy "admins manage store settings" on public.store_settings for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

grant select, insert, update, delete on public.orders, public.order_items to authenticated;
grant insert on public.orders, public.order_items to anon;
drop policy if exists "admins read all orders" on public.orders;
create policy "admins read all orders" on public.orders for select to authenticated
using ((select public.is_admin()));
drop policy if exists "admins update all orders" on public.orders;
create policy "admins update all orders" on public.orders for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins delete orders" on public.orders;
create policy "admins delete orders" on public.orders for delete to authenticated
using ((select public.is_admin()));
drop policy if exists "read own order items or admin" on public.order_items;
create policy "read own order items or admin" on public.order_items for select to authenticated
using (exists (
  select 1 from public.orders o
  where o.id = order_items.order_id
    and (o.user_id = (select auth.uid()) or (select public.is_admin()))
));
drop policy if exists "admins manage order items" on public.order_items;
create policy "admins manage order items" on public.order_items for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
