-- ============================================================
-- ポートフォリオ共有アプリ: 初期スキーマ
-- works（作品）/ share_links（共有リンク）と RLS、共有用RPC を定義する。
-- Supabaseプロジェクトの SQL Editor で実行するか、supabase CLI で適用する。
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- works（作品） ----------
create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  -- Supabase Storage `work-images` バケット内のオブジェクトパス
  image_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists works_owner_id_created_at_idx
  on public.works (owner_id, created_at desc);

alter table public.works enable row level security;

-- 本人のみ自分の作品を参照・作成・更新・削除できる
create policy "works_owner_select" on public.works
  for select using (auth.uid() = owner_id);
create policy "works_owner_insert" on public.works
  for insert with check (auth.uid() = owner_id);
create policy "works_owner_update" on public.works
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "works_owner_delete" on public.works
  for delete using (auth.uid() = owner_id);

-- ---------- share_links（共有リンク） ----------
create table if not exists public.share_links (
  token text primary key,
  work_id uuid not null references public.works (id) on delete cascade,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists share_links_work_id_idx
  on public.share_links (work_id);

alter table public.share_links enable row level security;

-- 共有リンクの作成・参照・削除は、その作品の所有者のみ
create policy "share_links_owner_all" on public.share_links
  for all
  using (
    exists (
      select 1 from public.works w
      where w.id = share_links.work_id and w.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.works w
      where w.id = share_links.work_id and w.owner_id = auth.uid()
    )
  );

-- ---------- 公開閲覧用RPC ----------
-- 共有トークンから作品を1件返す。SECURITY DEFINER で RLS を安全にバイパスし、
-- 有効なトークンに紐づく作品だけを匿名ユーザーへ公開する。
create or replace function public.get_shared_work(share_token text)
returns table (
  id uuid,
  title text,
  description text,
  image_path text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select w.id, w.title, w.description, w.image_path, w.created_at
  from public.works w
  join public.share_links s on s.work_id = w.id
  where s.token = share_token
    and (s.expires_at is null or s.expires_at > now());
$$;

grant execute on function public.get_shared_work(text) to anon, authenticated;
