import { supabase } from "@/lib/supabase";

export type ReelUpProductPreview = {
  id: number;
  name: string;
  price: number;
  old_price?: number | null;
  image_url?: string | null;
  images?: string[] | null;
  description?: string | null;
  full_description?: string | null;
  category_id?: number | null;
  stock?: number | null;
  is_featured?: boolean | null;
};

export type ReelUpItem = {
  id: number;
  title?: string | null;
  video_url: string;
  product_id?: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at?: string;
  product?: ReelUpProductPreview | null;
};

const REELUP_SELECT = `
  id,
  title,
  video_url,
  product_id,
  is_active,
  sort_order,
  created_at,
  updated_at,
  product:products!reelup_items_product_id_fkey (
    id,
    name,
    price,
    old_price,
    image_url,
    images,
    description,
    full_description,
    category_id,
    stock,
    is_featured
  )
`;

function normalizeReelUpItem(row: any): ReelUpItem {
  return {
    id: row.id,
    title: row.title ?? null,
    video_url: row.video_url,
    product_id: row.product_id ?? null,
    is_active: row.is_active,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at ?? undefined,
    product: Array.isArray(row.product)
      ? row.product[0] ?? null
      : row.product ?? null,
  };
}

export async function getActiveReelUpItems(): Promise<ReelUpItem[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reelup_items")
    .select(REELUP_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: false });

  if (error) {
    console.error("Failed to fetch active ReelUp items:", error);
    return [];
  }

  return (data ?? []).map(normalizeReelUpItem);
}

export async function getAllReelUpItems(): Promise<ReelUpItem[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reelup_items")
    .select(REELUP_SELECT)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: false });

  if (error) {
    console.error("Failed to fetch ReelUp items:", error);
    return [];
  }

  return (data ?? []).map(normalizeReelUpItem);
}

export async function uploadReelUpVideo(
  file: File
): Promise<{ filePath: string; publicUrl: string }> {
  if (!supabase) {
    throw new Error("Supabase client topilmadi");
  }

  const fileExt = file.name.split(".").pop() || "mp4";
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${fileExt}`;
  const filePath = `reelup/videos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("reels")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Failed to upload ReelUp video:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from("reels").getPublicUrl(filePath);

  return {
    filePath,
    publicUrl: data.publicUrl,
  };
}

export async function createReelUpItem(payload: {
  title?: string;
  video_url: string;
  product_id?: number | null;
  is_active?: boolean;
  sort_order?: number;
}) {
  if (!supabase) {
    throw new Error("Supabase client topilmadi");
  }

  const { data, error } = await supabase
    .from("reelup_items")
    .insert({
      title: payload.title ?? null,
      video_url: payload.video_url,
      product_id: payload.product_id ?? null,
      is_active: payload.is_active ?? true,
      sort_order: payload.sort_order ?? 0,
    })
    .select(REELUP_SELECT)
    .single();

  if (error) {
    console.error("Failed to create ReelUp item:", error);
    throw error;
  }

  return normalizeReelUpItem(data);
}

export async function updateReelUpItem(
  id: number,
  payload: Partial<{
    title: string | null;
    video_url: string;
    product_id: number | null;
    is_active: boolean;
    sort_order: number;
  }>
) {
  if (!supabase) {
    throw new Error("Supabase client topilmadi");
  }

  const { data, error } = await supabase
    .from("reelup_items")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(REELUP_SELECT)
    .single();

  if (error) {
    console.error("Failed to update ReelUp item:", error);
    throw error;
  }

  return normalizeReelUpItem(data);
}

export async function deleteReelUpItem(id: number) {
  if (!supabase) {
    throw new Error("Supabase client topilmadi");
  }

  const { error } = await supabase
    .from("reelup_items")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete ReelUp item:", error);
    throw error;
  }

  return true;
}