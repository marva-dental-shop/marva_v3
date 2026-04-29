"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Plus, Search, Trash2, X } from "lucide-react";
import {
  type ReelUpItem,
  getAllReelUpItems,
  createReelUpItem,
  updateReelUpItem,
  deleteReelUpItem,
  uploadReelUpVideo,
} from "@/lib/reelsup";
import { supabase } from "@/lib/supabase";

type AdminReelUpProduct = {
  id: number;
  name: string;
  price: number;
  old_price: number | null;
  image_url: string | null;
  images: string[] | null;
  description: string | null;
  is_active: boolean;
};

function getProductPreviewImage(product?: AdminReelUpProduct | null) {
  if (!product) return "";
  return product.images?.[0] || product.image_url || "";
}

export default function AdminReelsPage() {
  const [items, setItems] = useState<ReelUpItem[]>([]);
  const [products, setProducts] = useState<AdminReelUpProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [productId, setProductId] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const selectedProduct = useMemo(
    () => products.find((item) => String(item.id) === productId) || null,
    [products, productId]
  );

  const filteredProducts = useMemo(() => {
    const query = productQuery.trim().toLowerCase();

    const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name));

    if (!query) {
      return sorted.slice(0, 20);
    }

    return sorted
      .filter((product) => product.name.toLowerCase().includes(query))
      .slice(0, 20);
  }, [products, productQuery]);

  async function loadReelUpItems() {
    try {
      setLoading(true);
      const data = await getAllReelUpItems();
      setItems(data);
    } catch (error) {
      console.error("Failed to load ReelUp items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    if (!supabase) {
      setProducts([]);
      setProductsLoading(false);
      return;
    }

    try {
      setProductsLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select("id,name,price,old_price,image_url,images,description,is_active")
        .order("name", { ascending: true });

      if (error) {
        console.error("Failed to load products:", error);
        setProducts([]);
        return;
      }

      setProducts((data || []) as AdminReelUpProduct[]);
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }

  async function loadData() {
    await Promise.all([loadReelUpItems(), loadProducts()]);
  }

  useEffect(() => {
    void loadData();
  }, []);

  function handleSelectProduct(product: AdminReelUpProduct) {
    setProductId(String(product.id));
    setProductQuery(product.name);
    setIsProductPickerOpen(false);

    if (!title.trim()) {
      setTitle(product.name);
    }
  }

  function handleClearSelectedProduct() {
    setProductId("");
    setProductQuery("");
    setIsProductPickerOpen(false);
  }

  async function handleCreateReelUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!videoFile) {
      alert("Video file majburiy");
      return;
    }

    if (!productId) {
      alert("Mahsulot tanlash majburiy");
      return;
    }

    try {
      setSubmitting(true);

      const uploaded = await uploadReelUpVideo(videoFile);

      await createReelUpItem({
        title: title.trim() || undefined,
        video_url: uploaded.publicUrl,
        product_id: Number(productId),
        is_active: isActive,
        sort_order: Number(sortOrder) || 0,
      });

      setTitle("");
      setVideoFile(null);
      setProductId("");
      setProductQuery("");
      setSortOrder("0");
      setIsActive(true);
      setIsProductPickerOpen(false);

      const fileInput = document.getElementById(
        "reelup-video-input"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      await loadReelUpItems();
      alert("ReelUp video muvaffaqiyatli qo'shildi");
    } catch (error: any) {
      console.error("Failed to create ReelUp item:", error);

      const message =
        error?.message ||
        error?.error_description ||
        error?.details ||
        "ReelUp video qo'shishda xatolik yuz berdi";

      alert(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(item: ReelUpItem) {
    try {
      await updateReelUpItem(item.id, {
        is_active: !item.is_active,
      });

      await loadReelUpItems();
    } catch (error: any) {
      console.error("Failed to update ReelUp item:", error);
      alert(
        error?.message ||
          error?.details ||
          "Statusni o'zgartirib bo'lmadi"
      );
    }
  }

  async function handleSortOrderChange(item: ReelUpItem, value: string) {
    try {
      await updateReelUpItem(item.id, {
        sort_order: Number(value) || 0,
      });

      await loadReelUpItems();
    } catch (error: any) {
      console.error("Failed to update sort order:", error);
      alert(
        error?.message ||
          error?.details ||
          "Sort order yangilanmadi"
      );
    }
  }

  async function handleProductChange(item: ReelUpItem, value: string) {
    try {
      await updateReelUpItem(item.id, {
        product_id: value ? Number(value) : null,
      });

      await loadReelUpItems();
    } catch (error: any) {
      console.error("Failed to update ReelUp product:", error);
      alert(
        error?.message ||
          error?.details ||
          "Mahsulot yangilanmadi"
      );
    }
  }

  async function handleDelete(item: ReelUpItem) {
    const confirmed = window.confirm(
      `"${item.title || "Nomsiz ReelUp"}" ni o'chirmoqchimisiz?`
    );

    if (!confirmed) return;

    try {
      await deleteReelUpItem(item.id);
      await loadReelUpItems();
    } catch (error: any) {
      console.error("Failed to delete ReelUp item:", error);
      alert(
        error?.message ||
          error?.details ||
          "ReelUp videoni o'chirib bo'lmadi"
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F7F6]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="mb-3 inline-flex items-center gap-2 text-sm text-[#335E56] hover:text-[#12332D]"
            >
              <ArrowLeft size={16} />
              Admin panelga qaytish
            </Link>

            <h1 className="text-2xl font-bold text-[#12332D]">ReelUp</h1>
            <p className="mt-1 text-sm text-[#5F7B75]">
              ReelUp video yuklang va unga mahsulot biriktiring
            </p>
          </div>
        </div>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#12332D]">
            Yangi ReelUp video qo'shish
          </h2>

          <form onSubmit={handleCreateReelUp} className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#12332D]">
                Sarlavha
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masalan: Yangi aksiya"
                className="w-full rounded-2xl border border-[#D9E3DF] px-4 py-3 outline-none focus:border-[#12332D]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#12332D]">
                Video file <span className="text-red-500">*</span>
              </label>
              <input
                id="reelup-video-input"
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="w-full rounded-2xl border border-[#D9E3DF] px-4 py-3 outline-none focus:border-[#12332D]"
              />
            </div>

            <div className="relative">
              <label className="mb-1 block text-sm font-medium text-[#12332D]">
                Mahsulot <span className="text-red-500">*</span>
              </label>

              <div className="flex items-center gap-2 rounded-2xl border border-[#D9E3DF] bg-white px-4 py-3 focus-within:border-[#12332D]">
                <Search size={18} className="shrink-0 text-[#5F7B75]" />

                <input
                  value={productQuery}
                  onChange={(e) => {
                    setProductQuery(e.target.value);
                    setIsProductPickerOpen(true);

                    if (
                      selectedProduct &&
                      e.target.value.trim() !== selectedProduct.name
                    ) {
                      setProductId("");
                    }
                  }}
                  onFocus={() => setIsProductPickerOpen(true)}
                  onBlur={() => {
                    window.setTimeout(() => {
                      setIsProductPickerOpen(false);
                    }, 150);
                  }}
                  placeholder={
                    productsLoading
                      ? "Mahsulotlar yuklanmoqda..."
                      : "Mahsulot nomi bo'yicha qidiring..."
                  }
                  className="w-full bg-transparent outline-none placeholder:text-[#94A3B8]"
                />

                {productId ? (
                  <button
                    type="button"
                    onClick={handleClearSelectedProduct}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F7F6] text-[#5F7B75]"
                  >
                    <X size={16} />
                  </button>
                ) : null}
              </div>

              {isProductPickerOpen ? (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-auto rounded-2xl border border-[#E4ECE9] bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.10)]">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                      const previewImage = getProductPreviewImage(product);
                      const isSelected = String(product.id) === productId;

                      return (
                        <button
                          key={product.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelectProduct(product)}
                          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
                            isSelected ? "bg-[#ECF8F3]" : "hover:bg-[#F8FBFA]"
                          }`}
                        >
                          {previewImage ? (
                            <img
                              src={previewImage}
                              alt={product.name}
                              className="h-12 w-12 shrink-0 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F3F7F6] text-[11px] text-[#6B8A84]">
                              No image
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#12332D]">
                              {product.name}
                            </p>
                            <p className="mt-1 text-xs text-[#0A7A5A]">
                              ${product.price}
                              {!product.is_active ? " • inactive" : ""}
                            </p>
                          </div>

                          {isSelected ? (
                            <Check size={16} className="shrink-0 text-[#0A7A5A]" />
                          ) : null}
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-3 py-4 text-sm text-[#5F7B75]">
                      Mahsulot topilmadi
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {selectedProduct ? (
              <div className="rounded-2xl border border-[#E4ECE9] bg-[#F8FBFA] p-4">
                <div className="flex items-center gap-3">
                  {getProductPreviewImage(selectedProduct) ? (
                    <img
                      src={getProductPreviewImage(selectedProduct)}
                      alt={selectedProduct.name}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-xs text-[#5F7B75]">
                      No image
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#12332D]">
                      {selectedProduct.name}
                    </p>
                    <p className="mt-1 text-sm text-[#0A7A5A]">
                      ${selectedProduct.price}
                    </p>
                    {selectedProduct.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-[#5F7B75]">
                        {selectedProduct.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#12332D]">
                  Sort order
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full rounded-2xl border border-[#D9E3DF] px-4 py-3 outline-none focus:border-[#12332D]"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-3 rounded-2xl border border-[#D9E3DF] px-4 py-3 text-sm text-[#12332D]">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  Aktiv holatda qo'shilsin
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#12332D] px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
              >
                <Plus size={16} />
                {submitting ? "Upload qilinmoqda..." : "ReelUp qo'shish"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#12332D]">
              Mavjud ReelUp videolar
            </h2>
            <button
              type="button"
              onClick={() => void loadData()}
              className="rounded-xl border border-[#D9E3DF] px-3 py-2 text-sm text-[#12332D]"
            >
              Yangilash
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-[#5F7B75]">Yuklanmoqda...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-[#5F7B75]">Hozircha ReelUp video yo'q.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const productImage =
                  item.product?.images?.[0] || item.product?.image_url || "";

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#E4ECE9] p-4"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-base font-semibold text-[#12332D]">
                            {item.title || "Nomsiz ReelUp"}
                          </h3>

                          <p className="mt-2 break-all text-sm text-[#5F7B75]">
                            {item.video_url}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                            <span
                              className={`rounded-full px-3 py-1 ${
                                item.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {item.is_active ? "Aktiv" : "Noaktiv"}
                            </span>

                            <span className="text-[#5F7B75]">
                              Sort: {item.sort_order}
                            </span>

                            <span className="text-[#5F7B75]">
                              Product ID: {item.product_id ?? "yo'q"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 md:w-[240px]">
                          <button
                            type="button"
                            onClick={() => void handleToggleActive(item)}
                            className="rounded-xl border border-[#D9E3DF] px-3 py-2 text-sm text-[#12332D]"
                          >
                            {item.is_active ? "Noaktiv qilish" : "Aktiv qilish"}
                          </button>

                          <input
                            type="number"
                            defaultValue={item.sort_order}
                            onBlur={(e) =>
                              void handleSortOrderChange(item, e.target.value)
                            }
                            className="rounded-xl border border-[#D9E3DF] px-3 py-2 text-sm outline-none focus:border-[#12332D]"
                          />

                          <select
                            defaultValue={item.product_id ? String(item.product_id) : ""}
                            onChange={(e) =>
                              void handleProductChange(item, e.target.value)
                            }
                            className="rounded-xl border border-[#D9E3DF] bg-white px-3 py-2 text-sm outline-none focus:border-[#12332D]"
                          >
                            <option value="">Mahsulot tanlang</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - ${product.price}
                                {!product.is_active ? " (inactive)" : ""}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => void handleDelete(item)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600"
                          >
                            <Trash2 size={16} />
                            O'chirish
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[#F8FBFA] p-4">
                        {item.product ? (
                          <div className="flex items-center gap-3">
                            {productImage ? (
                              <img
                                src={productImage}
                                alt={item.product.name}
                                className="h-16 w-16 rounded-2xl object-cover"
                              />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-xs text-[#5F7B75]">
                                No image
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-[#12332D]">
                                {item.product.name}
                              </p>
                              <p className="mt-1 text-sm text-[#0A7A5A]">
                                ${item.product.price}
                              </p>
                              {item.product.description ? (
                                <p className="mt-1 line-clamp-2 text-xs text-[#5F7B75]">
                                  {item.product.description}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-[#5F7B75]">
                            Bu ReelUp videoga hali mahsulot biriktirilmagan.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}