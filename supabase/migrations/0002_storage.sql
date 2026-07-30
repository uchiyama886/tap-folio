-- ============================================================
-- 作品画像用の Storage バケットとポリシー
-- 共有ページ（匿名アクセス）でも画像を表示するため、バケットは public 読み取りにする。
-- 書き込みは認証済みユーザーが「自分のフォルダ(owner_id/...)」にのみ許可する。
-- ============================================================

insert into storage.buckets (id, name, public)
values ('work-images', 'work-images', true)
on conflict (id) do nothing;

-- アップロード: 認証済みユーザーが自分のIDフォルダ配下にのみ書き込める
create policy "work_images_owner_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'work-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 更新・削除も自分のフォルダのみ
create policy "work_images_owner_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'work-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "work_images_owner_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'work-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 公開読み取り（共有ページの画像表示に必要）
create policy "work_images_public_read" on storage.objects
  for select using (bucket_id = 'work-images');
