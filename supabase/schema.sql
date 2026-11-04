-- ==============================================================================
-- MORTAFAAT STORE | مرتفعات ستور
-- Complete Production Database Schema & Seed Data for Supabase (PostgreSQL)
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "pgcrypto";

-- 2. ENUMS
do $$ begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('customer', 'admin', 'owner');
  end if;
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum ('unpaid', 'pending_verification', 'paid', 'failed', 'refunded');
  end if;
end $$;

-- 3. PROFILES & ROLE-BASED ACCESS
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helper function: Check if current caller is an admin or owner
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'owner')
  );
$$;

-- Trigger: Automatically create profile on new Supabase Auth user registration
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.phone, new.raw_user_meta_data->>'phone'),
    'customer'
  )
  on conflict (id) do update
  set full_name = excluded.full_name,
      phone = coalesce(excluded.phone, profiles.phone),
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger: Prevent self-elevation to admin/owner
create or replace function public.prevent_self_role_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'غير مصرح: يحق فقط للمديرين وأصحاب المتجر تعديل الصلاحيات والأدوار';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
  before update on public.profiles
  for each row execute procedure public.prevent_self_role_change();

-- 4. CATEGORIES
create table if not exists public.categories (
  id text primary key,
  name_ar text not null,
  name_en text not null default '',
  icon text not null default 'Tag',
  image_url text,
  sort_order int not null default 0,
  item_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 5. PRODUCTS
create table if not exists public.products (
  id text primary key default gen_random_uuid()::text,
  sku text,
  name_ar text not null,
  name_en text not null default '',
  category_id text references public.categories(id) on delete set null,
  description text not null default '',
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= price),
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  images text[] not null default '{}',
  video_url text,
  rating numeric(3,2) not null default 0,
  reviews_count int not null default 0,
  features jsonb not null default '[]'::jsonb,
  sizes text[] not null default '{}',
  colors jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_deal boolean not null default false,
  deal_discount numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. HERO SLIDES
create table if not exists public.hero_slides (
  id text primary key default gen_random_uuid()::text,
  title_ar text not null,
  title_en text not null default '',
  subtitle_ar text not null default '',
  subtitle_en text not null default '',
  tag_ar text not null default '',
  tag_en text not null default '',
  cta_text_ar text not null default 'تسوق الآن',
  cta_text_en text not null default 'Shop Now',
  target_category text not null default 'all',
  image_url text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 7. BOT KNOWLEDGE RULES
create table if not exists public.bot_rules (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  keywords text[] not null default '{}',
  reply_text text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 8. CUSTOMER ADDRESSES
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  recipient_name text not null,
  phone text not null,
  governorate text not null,
  city text,
  address_line text not null,
  notes text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- 9. COUPONS
create table if not exists public.coupons (
  id text primary key default gen_random_uuid()::text,
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  min_order_value numeric(12,2) not null default 0,
  max_uses int,
  uses_count int not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 10. STORE SETTINGS
create table if not exists public.store_settings (
  id int primary key default 1 check (id = 1),
  store_name_ar text not null default 'مرتفعات ستور',
  store_name_en text not null default 'Mortafaat Store',
  currency text not null default 'EGP',
  phone text not null default '01067906474',
  whatsapp text not null default '201067906474',
  shipping_fee numeric(12,2) not null default 50,
  free_shipping_threshold numeric(12,2) not null default 1000,
  announcement_text_ar text not null default '🔥 عروض افتتاح مرتفعات ستور: شحن مجاني لأي طلب أكثر من 1000 جنيه + دفع عند الاستلام مع المعاينة قبل الدفع! 🔥',
  announcement_text_en text not null default '🔥 Mortafaat Opening Offers: Free shipping on orders over 1000 EGP + Cash on Delivery with full inspection! 🔥',
  slider_interval_seconds int not null default 5,
  cod_enabled boolean not null default true,
  online_payment_enabled boolean not null default false,
  online_gateway_name text not null default 'الدفع الإلكتروني (كروت ومحافظ)',
  online_gateway_environment text not null default 'test',
  return_policy_text text not null default 'يحق للعميل استبدال أو استرجاع المنتج خلال 14 يوماً من تاريخ الاستلام بشرط أن يكون المنتج بحالته الأصلية وفي غلافه، مع إمكانية فحص ومعاينة المنتج قبل الاستلام والدفع للمندوب.',
  shipping_policy_text text not null default 'يتم شحن وتوصيل الطلبات خلال 24 إلى 48 ساعة لمحافظات القاهرة والجيزة والإسكندرية، وخلال 3 إلى 4 أيام لباقي محافظات الجمهورية مع شركة شحن متخصصة.',
  privacy_policy_text text not null default 'نلتزم في مرتفعات ستور بحماية خصوصية عملائنا ولا نشارك أي بيانات شخصية أو عناوين مع أي جهة خارجية إلا لغرض توصيل الشحنة فقط.',
  updated_at timestamptz not null default now()
);
insert into public.store_settings (id) values (1) on conflict (id) do nothing;

-- 11. PAYMENT GATEWAYS
create table if not exists public.payment_gateways (
  id text primary key default gen_random_uuid()::text,
  provider text not null,
  display_name text not null,
  is_enabled boolean not null default false,
  public_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 12. ORDERS
create table if not exists public.orders (
  id text primary key,
  order_number bigint generated always as identity unique,
  user_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  phone text not null,
  email text,
  governorate text not null,
  shipping_address text not null,
  notes text,
  subtotal numeric(12,2) not null check (subtotal >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  coupon_code text,
  shipping_fee numeric(12,2) not null check (shipping_fee >= 0),
  total numeric(12,2) not null check (total >= 0),
  payment_method text not null check (payment_method in ('cod', 'online-gateway', 'online')),
  payment_status public.payment_status not null default 'unpaid',
  gateway_provider text,
  gateway_transaction_id text,
  status public.order_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 13. ORDER ITEMS
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  sku text,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  selected_size text,
  selected_color text,
  line_total numeric(12,2) generated always as (unit_price * quantity) stored
);

-- 14. ADMIN AUDIT LOG
create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Audit log helper
create or replace function public.capture_admin_audit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_id text;
begin
  if public.is_admin() then
    v_id := coalesce(to_jsonb(new)->>'id', to_jsonb(old)->>'id');
    insert into public.admin_audit_log (actor_id, action, entity_type, entity_id, details)
    values (
      auth.uid(),
      lower(TG_OP),
      TG_TABLE_NAME,
      v_id,
      jsonb_build_object(
        'before', case when TG_OP = 'INSERT' then null else to_jsonb(old) end,
        'after', case when TG_OP = 'DELETE' then null else to_jsonb(new) end
      )
    );
  end if;
  if TG_OP = 'DELETE' then return old; end if;
  return new;
end;
$$;

-- 15. INDEXES FOR HIGH PERFORMANCE
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_idx on public.products(is_active);
create index if not exists products_featured_idx on public.products(is_featured);
create index if not exists orders_user_idx on public.orders(user_id, created_at desc);
create index if not exists orders_status_idx on public.orders(status, created_at desc);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists coupons_code_idx on public.coupons(code);

-- 16. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.hero_slides enable row level security;
alter table public.bot_rules enable row level security;
alter table public.addresses enable row level security;
alter table public.coupons enable row level security;
alter table public.store_settings enable row level security;
alter table public.payment_gateways enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.admin_audit_log enable row level security;

-- Profiles: Users see own, Admins see all. Only Admins can change roles.
drop policy if exists "profiles read self or admin" on public.profiles;
create policy "profiles read self or admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles update self safe" on public.profiles;
create policy "profiles update self safe" on public.profiles
  for update to authenticated using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Categories: Public read active, Admin manage all
drop policy if exists "public read active categories" on public.categories;
create policy "public read active categories" on public.categories
  for select to anon, authenticated using (is_active or public.is_admin());

drop policy if exists "admin manage categories" on public.categories;
create policy "admin manage categories" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Products: Public read active, Admin manage all
drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products
  for select to anon, authenticated using (is_active or public.is_admin());

drop policy if exists "admin manage products" on public.products;
create policy "admin manage products" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Hero Slides: Public read active, Admin manage all
drop policy if exists "public read active slides" on public.hero_slides;
create policy "public read active slides" on public.hero_slides
  for select to anon, authenticated using (is_active or public.is_admin());

drop policy if exists "admin manage slides" on public.hero_slides;
create policy "admin manage slides" on public.hero_slides
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Bot Rules: Public read active, Admin manage all
drop policy if exists "public read active bot rules" on public.bot_rules;
create policy "public read active bot rules" on public.bot_rules
  for select to anon, authenticated using (is_active or public.is_admin());

drop policy if exists "admin manage bot rules" on public.bot_rules;
create policy "admin manage bot rules" on public.bot_rules
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Addresses: Customer manage own, Admin can read
drop policy if exists "customer manage own addresses" on public.addresses;
create policy "customer manage own addresses" on public.addresses
  for all to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- Coupons: Public read active for validation, Admin manage all
drop policy if exists "public read active coupons" on public.coupons;
create policy "public read active coupons" on public.coupons
  for select to anon, authenticated using (is_active or public.is_admin());

drop policy if exists "admin manage coupons" on public.coupons;
create policy "admin manage coupons" on public.coupons
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Store Settings: Public read, Admin manage
drop policy if exists "public read store settings" on public.store_settings;
create policy "public read store settings" on public.store_settings
  for select to anon, authenticated using (true);

drop policy if exists "admin update store settings" on public.store_settings;
create policy "admin update store settings" on public.store_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Payment Gateways: Public read enabled, Admin manage
drop policy if exists "public read enabled gateways" on public.payment_gateways;
create policy "public read enabled gateways" on public.payment_gateways
  for select to anon, authenticated using (is_enabled);

drop policy if exists "admin manage gateways" on public.payment_gateways;
create policy "admin manage gateways" on public.payment_gateways
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Orders: Customer can read their own orders; Admin can read and update all orders
drop policy if exists "customer read own orders or admin" on public.orders;
create policy "customer read own orders or admin" on public.orders
  for select to anon, authenticated
  using ((auth.uid() is not null and user_id = auth.uid()) or public.is_admin());

drop policy if exists "admin update orders" on public.orders;
create policy "admin update orders" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin delete orders" on public.orders;
create policy "admin delete orders" on public.orders
  for delete to authenticated using (public.is_admin());

-- Order Items: Customer can read items of own order; Admin can manage all
drop policy if exists "customer read own order items or admin" on public.order_items;
create policy "customer read own order items or admin" on public.order_items
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and ((auth.uid() is not null and o.user_id = auth.uid()) or public.is_admin())
    )
  );

drop policy if exists "admin manage order items" on public.order_items;
create policy "admin manage order items" on public.order_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Admin Audit Log: Admin only
drop policy if exists "admin audit read" on public.admin_audit_log;
create policy "admin audit read" on public.admin_audit_log
  for select to authenticated using (public.is_admin());

-- Audit triggers
drop trigger if exists audit_products on public.products;
create trigger audit_products after insert or update or delete on public.products
  for each row execute procedure public.capture_admin_audit();

drop trigger if exists audit_categories on public.categories;
create trigger audit_categories after insert or update or delete on public.categories
  for each row execute procedure public.capture_admin_audit();

drop trigger if exists audit_coupons on public.coupons;
create trigger audit_coupons after insert or update or delete on public.coupons
  for each row execute procedure public.capture_admin_audit();

drop trigger if exists audit_orders on public.orders;
create trigger audit_orders after update on public.orders
  for each row execute procedure public.capture_admin_audit();


-- ==============================================================================
-- 17. SECURE SERVER-SIDE ORDER CREATION (ATOMIC COD TRANSACTION)
-- Prices, stock, discounts and totals are computed strictly in DB, never trusted from client!
-- ==============================================================================
create or replace function public.create_cod_order(
  p_order_id text,
  p_customer_name text,
  p_phone text,
  p_email text,
  p_governorate text,
  p_address text,
  p_notes text,
  p_items jsonb,
  p_coupon_code text default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id text;
  v_order_number bigint;
  v_subtotal numeric(12,2) := 0;
  v_discount numeric(12,2) := 0;
  v_shipping numeric(12,2);
  v_threshold numeric(12,2);
  v_total numeric(12,2);
  v_coupon public.coupons%rowtype;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty int;
  v_clean_coupon text;
begin
  -- Validate basic customer input
  if coalesce(trim(p_customer_name), '') = '' then
    raise exception 'يرجى إدخال اسم العميل بالكامل';
  end if;
  if coalesce(trim(p_phone), '') = '' then
    raise exception 'يرجى إدخال رقم الهاتف للتواصل والشحن';
  end if;
  if coalesce(trim(p_governorate), '') = '' then
    raise exception 'يرجى اختيار المحافظة';
  end if;
  if coalesce(trim(p_address), '') = '' then
    raise exception 'يرجى إدخال عنوان التوصيل بالتفصيل';
  end if;

  -- Validate cart items
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'سلة المشتريات فارغة';
  end if;

  -- Set order ID
  v_order_id := coalesce(nullif(trim(p_order_id), ''), 'ORD-' || floor(1000 + random() * 9000)::text);

  -- Check if order with this exact ID already exists (idempotency guard)
  if exists (select 1 from public.orders where id = v_order_id) then
    select id, order_number, total, subtotal, shipping_fee, discount_amount
    into v_order_id, v_order_number, v_total, v_subtotal, v_shipping, v_discount
    from public.orders where id = v_order_id;
    return jsonb_build_object(
      'success', true,
      'order_id', v_order_id,
      'order_number', v_order_number,
      'total', v_total,
      'subtotal', v_subtotal,
      'shipping_fee', v_shipping,
      'discount_amount', v_discount,
      'message', 'تم استرجاع الطلب المسجل مسبقاً'
    );
  end if;

  -- Verify each item, lock product row FOR UPDATE to prevent race overselling
  for v_item in select value from jsonb_array_elements(p_items) loop
    v_qty := coalesce((v_item->>'quantity')::int, 0);
    if v_qty < 1 or v_qty > 99 then
      raise exception 'الكمية المطلوبة غير صحيحة';
    end if;

    select * into v_product from public.products
    where id = (v_item->>'product_id')::text and is_active = true
    for update;

    if not found then
      raise exception 'أحد المنتجات المطلوبة غير متوفر حالياً';
    end if;

    if v_product.stock_quantity < v_qty then
      raise exception 'عفواً، الكمية المتاحة في المخزون من "%" هي % فقط', v_product.name_ar, v_product.stock_quantity;
    end if;

    -- Compute real subtotal using verified DB price
    v_subtotal := v_subtotal + (v_product.price * v_qty);
  end loop;

  -- Shipping calculation from DB store_settings
  select shipping_fee, free_shipping_threshold
  into v_shipping, v_threshold
  from public.store_settings where id = 1;

  v_shipping := coalesce(v_shipping, 50);
  v_threshold := coalesce(v_threshold, 1000);

  if v_subtotal >= v_threshold then
    v_shipping := 0;
  end if;

  -- Verify Coupon if provided
  v_clean_coupon := nullif(upper(trim(coalesce(p_coupon_code, ''))), '');
  if v_clean_coupon is not null then
    select * into v_coupon from public.coupons
    where upper(code) = v_clean_coupon and is_active = true
      and (starts_at is null or starts_at <= now())
      and (expires_at is null or expires_at > now())
      and (max_uses is null or uses_count < max_uses)
    for update;

    if not found then
      raise exception 'كوبون الخصم غير صالح أو منتهي الصلاحية';
    end if;

    if v_subtotal < v_coupon.min_order_value then
      raise exception 'قيمة المشتريات أقل من الحد الأدنى لتفعيل هذا الكوبون (% ج.م)', v_coupon.min_order_value;
    end if;

    if v_coupon.discount_type = 'percentage' then
      v_discount := round((v_subtotal * v_coupon.discount_value / 100.0), 2);
    else
      v_discount := v_coupon.discount_value;
    end if;

    v_discount := least(v_discount, v_subtotal);
    update public.coupons set uses_count = uses_count + 1 where id = v_coupon.id;
  end if;

  -- Calculate final total
  v_total := greatest(0, (v_subtotal - v_discount) + v_shipping);

  -- Insert order header
  insert into public.orders (
    id,
    user_id,
    customer_name,
    phone,
    email,
    governorate,
    shipping_address,
    notes,
    subtotal,
    discount_amount,
    coupon_code,
    shipping_fee,
    total,
    payment_method,
    payment_status,
    status
  ) values (
    v_order_id,
    v_user_id,
    trim(p_customer_name),
    trim(p_phone),
    nullif(trim(coalesce(p_email, '')), ''),
    trim(p_governorate),
    trim(p_address),
    nullif(trim(coalesce(p_notes, '')), ''),
    v_subtotal,
    v_discount,
    v_clean_coupon,
    v_shipping,
    v_total,
    'cod',
    'unpaid',
    'pending'
  ) returning order_number into v_order_number;

  -- Insert order items & deduct stock atomically
  for v_item in select value from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::int;

    select * into v_product from public.products
    where id = (v_item->>'product_id')::text for update;

    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      sku,
      unit_price,
      quantity,
      selected_size,
      selected_color
    ) values (
      v_order_id,
      v_product.id,
      v_product.name_ar,
      v_product.sku,
      v_product.price,
      v_qty,
      nullif(v_item->>'selected_size', ''),
      nullif(v_item->>'selected_color', '')
    );

    update public.products
    set stock_quantity = stock_quantity - v_qty,
        updated_at = now()
    where id = v_product.id;
  end loop;

  return jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total', v_total,
    'subtotal', v_subtotal,
    'shipping_fee', v_shipping,
    'discount_amount', v_discount,
    'message', 'تم تسجيل طلبك بنجاح وجارٍ التجهيز'
  );
end;
$$;

-- Grant execution to anon and authenticated users
grant execute on function public.create_cod_order(text, text, text, text, text, text, text, jsonb, text) to anon, authenticated;


-- ==============================================================================
-- 18. STORAGE SETUP FOR PRODUCT IMAGES
-- ==============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "admins upload product images" on storage.objects;
create policy "admins upload product images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "admins update product images" on storage.objects;
create policy "admins update product images" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "admins delete product images" on storage.objects;
create policy "admins delete product images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());


-- ==============================================================================
-- 19. REALTIME PUBLICATION
-- Enables real-time order dashboard notifications for the store admin
-- ==============================================================================
do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when others then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.products;
exception when others then null;
end $$;


-- ==============================================================================
-- 20. SEED DATA (POPULATES THE STORE WITH REAL READY-TO-USE DATA)
-- ==============================================================================

-- Categories Seed
insert into public.categories (id, name_ar, name_en, icon, image_url, sort_order, item_count, is_active) values
('electronics', 'الإلكترونيات والذكاء', 'Electronics', 'Smartphone', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80', 1, 24, true),
('fashion', 'الملابس والأزياء', 'Fashion & Apparel', 'Shirt', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80', 2, 38, true),
('perfumes', 'العطور الفاخرة', 'Perfumes', 'Sparkles', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80', 3, 19, true),
('home', 'الأدوات المنزلية', 'Home Appliances', 'Home', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80', 4, 31, true),
('personal-care', 'العناية والأدوات الشخصية', 'Personal Care', 'HeartPulse', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', 5, 22, true)
on conflict (id) do nothing;

-- Hero Slides Seed
insert into public.hero_slides (id, title_ar, title_en, subtitle_ar, subtitle_en, tag_ar, tag_en, cta_text_ar, cta_text_en, target_category, image_url, sort_order, is_active) values
('slide-1', 'أناقة وفخامة تليق بك', 'Elegance & Luxury For You', 'تشكيلة الشتاء الفاخرة وعطور شموخ المرتفعات الملكية بأسعار حصرية', 'Exclusive winter apparel & royal Shomookh perfumes at premier prices', 'وصل حديثاً 2026', 'New Arrival 2026', 'تسوق الأزياء والعطور', 'Shop Fashion', 'fashion', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80', 1, true),
('slide-2', 'أقوى عروض الإلكترونيات والذكاء', 'Top Electronics & Smart Deals', 'سماعات عازلة للضوضاء، ساعات ذكية، وشواحن فائقة السرعة بخصم حتى 40%', 'Noise-cancelling earbuds, smartwatches & fast chargers up to 40% off', 'تخفيضات كبرى', 'Major Sale', 'اكتشف الإلكترونيات', 'Explore Electronics', 'electronics', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1200&q=80', 2, true),
('slide-3', 'بيتك يستحق الأفضل دائماً', 'Your Home Deserves The Best', 'قلايات هوائية ذكية وأجهزة منزلية متطورة تجعل حياتك أسهل وأسرع', 'Smart air fryers & advanced home appliances making daily life easier', 'ضمان عامين كاملين', '2-Year Warranty', 'تسوق الأجهزة المنزلية', 'Shop Home Appliances', 'home', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80', 3, true)
on conflict (id) do nothing;

-- Products Seed
insert into public.products (
  id, sku, name_ar, name_en, category_id, description, price, compare_at_price, stock_quantity,
  images, video_url, features, sizes, colors, is_active, is_featured, is_deal, deal_discount
) values
(
  'p-1', 'EAR-ANC-01', 'سماعات بلوتوث لاسلكية برو عازلة للضوضاء ANC', 'Wireless ANC Pro Earbuds', 'electronics',
  'سماعات أذن لاسلكية بتقنية البلوتوث 5.3 مع خاصية إلغاء الضوضاء النشط (Active Noise Cancellation) وبطارية تدوم حتى 36 ساعة مع علبة الشحن. صوت نقي بيز عميق مع ميكروفون مدمج مزدوج للمكالمات الواضحة.',
  890.00, 1350.00, 45,
  array['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=800&q=80'],
  'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-with-earphones-42657-large.mp4',
  '["إلغاء الضوضاء الفعال ANC", "بطارية 36 ساعة تشغيل", "مقاومة لرذاذ الماء IPX5", "شحن سريع عبر Type-C"]'::jsonb,
  array[]::text[],
  '[]'::jsonb,
  true, true, true, 34.00
),
(
  'p-2', 'WAT-AMOLED-02', 'ساعة ذكية ألترا بشاشة AMOLED رياضية مقاومة للماء', 'Ultra AMOLED Smartwatch', 'electronics',
  'ساعة ذكية بتصميم معدني فخم وشاشة AMOLED عالية السطوع تحت الشمس، تدعم إجراء واستقبال المكالمات، قياس نبضات القلب ونسبة الأكسجين وتتبع الأنشطة الرياضية مع سوار إضافي هدية.',
  1450.00, 2100.00, 28,
  array['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'],
  null,
  '["إجراء واستقبال المكالمات Bluetooth", "شاشة AMOLED Always-on", "بطارية تدوم 7 أيام", "مقاومة الماء بالكامل"]'::jsonb,
  array[]::text[],
  '[]'::jsonb,
  true, true, true, 31.00
),
(
  'p-3', 'HOOD-EGY-03', 'هودي شتوي قطن أوفر سايز فاخر بطباعة حصرية', 'Premium Oversized Winter Hoodie', 'fashion',
  'هودي شتوي ميلتون ثقيل مبطن بوبرة داخلية ناعمة لتدفئة فائقة، خامات قطنية مصرية 100% عالية الجودة لا تنكمش مع الغسيل بتطريز أنيق يحمل روح مرتفعات ستور.',
  650.00, 850.00, 60,
  array['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80'],
  null,
  '["قطن مصري 100% مبطن", "قصة Oversized عصرية", "جيوب كانغارو مريحة", "ألوان ثابتة تماماً"]'::jsonb,
  array['M', 'L', 'XL', '2XL'],
  '[{"name": "أسود فحمي", "hex": "#0F172A"}, {"name": "أبيض لؤلؤي", "hex": "#F8FAFC"}, {"name": "رمادي داكن", "hex": "#475569"}]'::jsonb,
  true, true, false, null
),
(
  'p-4', 'JAC-PUFF-04', 'جاكيت بامب ووتر بروف شتوي مقاوم للأمطار والرياح', 'Waterproof Winter Puffer Jacket', 'fashion',
  'جاكيت شتوي أنيق بتقنية العزل الحراري ومقاومة المياه والرياح، مزود بغطاء رأس قابل للفك وسوست متينة مستوردة مع جيوب جانبية دافئة.',
  1190.00, 1600.00, 18,
  array['https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80'],
  null,
  '["مقاوم للأمطار والرياح Waterproof", "حشوة فايبر حراري خفيف الوزن", "سحابات متينة", "كابيشون قابل للفصل"]'::jsonb,
  array['L', 'XL', '2XL', '3XL'],
  '[]'::jsonb,
  true, false, false, null
),
(
  'p-5', 'PERF-SHOM-05', 'عطر "شموخ المرتفعات" الفاخر ثبات وفوحان 24 ساعة (100 مل)', 'Shomookh Al-Mortafaat Luxury Perfume 100ml', 'perfumes',
  'توليفة عطرية ملكية خاصة بمرتفعات ستور تجمع بين نفحات العود الملكي، العنبر الدافئ، والتوابل الشرقية مع لمسة انتعاش البرغموت. ثبات وفوحان استثنائي يدوم لأكثر من 24 ساعة.',
  980.00, 1400.00, 35,
  array['https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80'],
  null,
  '["ثبات مضمون لأكثر من 24 ساعة", "مكونات زيوت فرنسية نقية", "زجاجة كرستالية أنيقة 100 مل", "مناسب لجميع المناسبات"]'::jsonb,
  array[]::text[],
  '[]'::jsonb,
  true, true, true, 30.00
),
(
  'p-6', 'APP-AIRFRY-06', 'قلاية هوائية رقمية ذكية سعة 6.5 لتر بدون زيت بتقنية 360 Air', 'Smart Digital Air Fryer 6.5L', 'home',
  'قلاية هوائية عائلية كبيرة شاشة لمس ديجيتال بـ 8 برامج طهي ذكية مسبقة الإعداد، تقلي وتشوي وتخبز بدهون أقل بنسبة 85% مع طلاء غير لاصق وسهلة التنظيف بغسالة الأطباق.',
  2750.00, 3500.00, 15,
  array['https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'],
  null,
  '["سعة عائلية ضخمة 6.5 لتر", "شاشة لمس LED مع 8 برامج", "قلي صحي بدون دهون", "ضمان عامين كاملين"]'::jsonb,
  array[]::text[],
  '[]'::jsonb,
  true, true, false, null
),
(
  'p-7', 'CARE-SHAV-07', 'ماكينة حلاقة وتشذيب رجالية متطورة 7 في 1 مضادة للماء', 'Professional 7-in-1 Grooming Shaver Kit', 'personal-care',
  'طقم متكامل للعناية الشخصية للرجال يضم شفرات ستانلس ستيل حادة ذاتية الشحذ، رؤوس لتشذيب الذقن وشعر الأنف والأذن، بطارية ليثيوم تدوم 90 دقيقة وشاشة لعرض نسبة الشحن.',
  720.00, 950.00, 50,
  array['https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80'],
  null,
  '["7 رؤوس تبديل مختلفة", "شفرات ستانلس ستيل ذاتية الشحذ", "شاشة رقمية لنسبة البطارية", "مقاومة للماء وسهلة الغسيل"]'::jsonb,
  array[]::text[],
  '[]'::jsonb,
  true, true, true, 24.00
),
(
  'p-8', 'CARE-BRUSH-08', 'فرشاة تصفيف وفرد الشعر الحرارية سيراميك بالأيونات', 'Ceramic Ionic Hair Straightener Brush', 'personal-care',
  'فرشاة فرد الشعر الاحترافية بألواح سيراميك تورمالين توزع الحرارة بتساوٍ لحماية بصيلات الشعر وتوليد ملايين الأيونات السالبة لمنع الهيشان والحصول على شعر حريري في دقائق.',
  640.00, 850.00, 30,
  array['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'],
  null,
  '["تسخين فوري خلال 30 ثانية", "درجات حرارة قابلة للتعديل", "تقنية الأيونات ضد الهيشان", "سلك دوار 360 درجة"]'::jsonb,
  array[]::text[],
  '[]'::jsonb,
  true, false, false, null
)
on conflict (id) do nothing;

-- Coupons Seed
insert into public.coupons (id, code, discount_type, discount_value, min_order_value, max_uses, uses_count, is_active) values
('c-1', 'MORTAFAAT10', 'percentage', 10.00, 500.00, 1000, 0, true),
('c-2', 'WELCOME50', 'fixed', 50.00, 300.00, 500, 0, true)
on conflict (id) do nothing;

-- Bot Rules Seed
insert into public.bot_rules (id, title, keywords, reply_text, is_active) values
('r-1', 'قاعدة الشحن ومصاريف التوصيل', array['شحن', 'توصيل', 'مصاريف', 'شحن مجاني', 'تكلفة'], 'مصاريف الشحن الافتراضية 50 جنيه فقط لجميع المحافظات! ولو طلبك بمبلغ 1000 جنيه أو أكثر، ستحصل على شحن مجاني بالكامل 🎉', true),
('r-2', 'قاعدة طريقة الدفع والمعاينة', array['دفع', 'طريقة الدفع', 'كاش', 'معاينة', 'استلام', 'فحص'], 'الدفع متاح نقداً عند الاستلام (Cash on Delivery). والأهم أن لك الحق في فحص ومعاينة الأوردر بالكامل والتأكد من الجودة قبل دفع أي مليم للمندوب 👍', true),
('r-3', 'قاعدة الهدايا وعروض الشراء', array['عرض', 'عروض', 'هدية', 'هدايا', 'اثنين', 'خصم'], 'عند شرائك قطعتين من أي منتج ستحصل على هدية فورية قيمة مع الأوردر + كود خصم خاص على طلبك القادم! استخدم كود الخصم MORTAFAAT10 للحصول على 10% خصم إضافي.', true),
('r-4', 'قاعدة التواصل المباشر ورقم الهاتف', array['تليفون', 'رقم', 'واتس', 'واتساب', 'موبايل', 'خدمة العملاء'], 'يمكنك التواصل معنا مباشرة مع الإدارة أو الطلب هاتفياً وعبر واتساب على رقمنا المعتمد: 01067906474.', true),
('r-5', 'قاعدة الاستبدال والاسترجاع', array['استرجاع', 'استبدال', 'ضمان', 'رجع'], 'نضمن لك استبدال واسترجاع مجاني خلال 14 يوماً من استلام الطلب بكل سهولة إذا كان المنتج غير مطابق.', true)
on conflict (id) do nothing;

-- ==============================================================================
-- INSTRUCTIONS TO PROMOTE FIRST OWNER:
-- After registering an account via the storefront, run the following in Supabase SQL Editor:
--
-- update public.profiles
-- set role = 'owner'
-- where id = (select id from auth.users where email = 'YOUR_EMAIL@DOMAIN.COM');
-- ==============================================================================
