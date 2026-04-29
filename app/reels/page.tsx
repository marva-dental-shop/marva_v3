"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBasket,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCartStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { getActiveReelUpItems, type ReelUpItem } from "@/lib/reelsup";

const VIEWED_REELUP_KEY = "marva-viewed-reelup-ids";

function getViewedReelUpIds(): number[] {
  try {
    const saved = localStorage.getItem(VIEWED_REELUP_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((id): id is number => typeof id === "number");
  } catch {
    return [];
  }
}

function getFirstUnseenIndex(items: ReelUpItem[], viewedIds: number[]) {
  if (!items.length) return 0;

  const index = items.findIndex((item) => !viewedIds.includes(item.id));
  return index >= 0 ? index : 0;
}

function getProductImage(item?: ReelUpItem | null) {
  if (!item?.product) return "";
  return item.product.images?.[0] || item.product.image_url || "";
}

function mapToCartProduct(item?: ReelUpItem | null): Product | null {
  if (!item?.product) return null;

  const image = item.product.images?.[0] || item.product.image_url || "";

  return {
    id: String(item.product.id),
    slug: `product-${item.product.id}`,
    categoryId: item.product.category_id
      ? String(item.product.category_id)
      : "",
    name: item.product.name,
    price: Number(item.product.price || 0),
    oldPrice: item.product.old_price
      ? Number(item.product.old_price)
      : undefined,
    currency: "USD",
    image,
    shortDescription: item.product.description || "Dental mahsulot",
    description:
      item.product.full_description ||
      item.product.description ||
      "Dental mahsulot",
    stock: Number(item.product.stock ?? 0),
    featured: Boolean(item.product.is_featured),
  };
}

export default function ReelsPage() {
  const { items: cartItems, addItem, changeQuantity, removeItem } = useCartStore();

  const [reelUpItems, setReelUpItems] = useState<ReelUpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [initialIndex, setInitialIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [progressById, setProgressById] = useState<Record<number, number>>({});

  const containerRef = useRef<HTMLDivElement | null>(null);
const slideRefs = useRef<Record<number, HTMLElement | null>>({});
const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  useEffect(() => {
    let mounted = true;

    async function loadReelUpItems() {
      try {
        setLoading(true);
        const data = await getActiveReelUpItems();
        const viewedIds = getViewedReelUpIds();
        const nextInitialIndex = getFirstUnseenIndex(data, viewedIds);

        if (!mounted) return;

        setReelUpItems(data);
        setInitialIndex(nextInitialIndex);
        setCurrentIndex(nextInitialIndex);
      } catch (error) {
        console.error("Failed to load active ReelUp items:", error);

        if (!mounted) return;
        setReelUpItems([]);
        setInitialIndex(0);
        setCurrentIndex(0);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadReelUpItems();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!reelUpItems.length) return;

    const frame = requestAnimationFrame(() => {
      slideRefs.current[initialIndex]?.scrollIntoView({
        block: "start",
        behavior: "auto",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [reelUpItems, initialIndex]);

  useEffect(() => {
    if (!reelUpItems.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let bestEntry: IntersectionObserverEntry | null = null;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          if (
            !bestEntry ||
            entry.intersectionRatio > bestEntry.intersectionRatio
          ) {
            bestEntry = entry;
          }
        }

        if (!bestEntry) return;

        const index = Number(
          (bestEntry.target as HTMLDivElement).dataset.index || 0
        );

        setCurrentIndex(index);
      },
      {
        threshold: [0.45, 0.6, 0.75],
        root: containerRef.current,
      }
    );

    reelUpItems.forEach((_, index) => {
      const el = slideRefs.current[index];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [reelUpItems]);

  useEffect(() => {
    if (!reelUpItems.length) return;

    reelUpItems.forEach((item, index) => {
      const video = videoRefs.current[index];
      if (!video) return;

      video.muted = isMuted;

      if (index === currentIndex) {
        void video.play().catch((error) => {
          console.error("Failed to autoplay ReelUp video:", error);
        });
      } else {
        video.pause();
      }
    });
  }, [currentIndex, reelUpItems, isMuted]);

  useEffect(() => {
    const currentItem = reelUpItems[currentIndex];
    if (!currentItem) return;

    try {
      const ids = getViewedReelUpIds();
      if (ids.includes(currentItem.id)) return;

      localStorage.setItem(
        VIEWED_REELUP_KEY,
        JSON.stringify([...ids, currentItem.id])
      );
    } catch (error) {
      console.error("Failed to save viewed ReelUp id:", error);
    }
  }, [currentIndex, reelUpItems]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const goToIndex = (index: number) => {
    const safeIndex = Math.max(0, Math.min(index, reelUpItems.length - 1));
    slideRefs.current[safeIndex]?.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  };

  const goToNext = () => {
    if (currentIndex < reelUpItems.length - 1) {
      goToIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      goToIndex(currentIndex - 1);
    }
  };

  const currentItem = reelUpItems[currentIndex];

  const currentCartProduct = useMemo(
    () => mapToCartProduct(currentItem),
    [currentItem]
  );

  const currentCartItem = useMemo(() => {
    if (!currentCartProduct) return undefined;
    return cartItems.find((item) => item.product.id === currentCartProduct.id);
  }, [cartItems, currentCartProduct]);

  const quantity = currentCartItem?.quantity || 0;

  const handleAddToCart = () => {
    if (!currentCartProduct) return;
    if (currentCartProduct.stock <= 0) return;
    addItem(currentCartProduct);
  };

  const increase = () => {
    if (!currentCartProduct) return;
    if (currentCartProduct.stock <= 0) return;

    if (!currentCartItem) {
      addItem(currentCartProduct);
      return;
    }

    if (quantity >= currentCartProduct.stock) return;
    changeQuantity(currentCartProduct.id, quantity + 1);
  };

  const decrease = () => {
    if (!currentCartProduct || !currentCartItem) return;

    if (quantity <= 1) {
      removeItem(currentCartProduct.id);
      return;
    }

    changeQuantity(currentCartProduct.id, quantity - 1);
  };

  if (loading) {
    return (
      <main className="fixed inset-0 bg-black text-white">
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <p className="text-sm text-white/70">ReelUp yuklanmoqda...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!reelUpItems.length) {
    return (
      <main className="fixed inset-0 bg-black text-white">
        <div className="flex h-full items-center justify-center px-4">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
            <p className="text-lg font-semibold text-white">
              Hozircha ReelUp video yo‘q
            </p>
            <p className="mt-2 text-sm text-white/65">
              Admin paneldan ReelUp video qo‘shilgandan keyin shu yerda chiqadi.
            </p>

            <Link
              href="/"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#12332D]"
            >
              Bosh sahifaga qaytish
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 bg-black text-white">
      <div className="mx-auto h-full max-w-md bg-black">
        <div
          ref={containerRef}
          className="h-full snap-y snap-mandatory overflow-y-auto"
        >
          {reelUpItems.map((item, index) => {
            const productImage = getProductImage(item);
            const product = mapToCartProduct(item);
            const cartItem = product
              ? cartItems.find((cart) => cart.product.id === product.id)
              : undefined;
            const itemQuantity = cartItem?.quantity || 0;
            const progress = progressById[item.id] ?? 0;

            return (
              <section
                key={item.id}
                ref={(el) => {
                  slideRefs.current[index] = el;
                }}
                data-index={index}
                className="relative h-[100dvh] w-full snap-start overflow-hidden bg-black"
              >
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  src={item.video_url}
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay={index === currentIndex}
                  muted={isMuted}
                  playsInline
                  preload="auto"
                  controls={false}
                  onCanPlay={() => {
                    if (index === currentIndex) {
                      const video = videoRefs.current[index];
                      if (video) {
                        video.muted = isMuted;
                        void video.play().catch(() => {});
                      }
                    }
                  }}
                  onTimeUpdate={(event) => {
                    const video = event.currentTarget;

                    if (!video.duration || Number.isNaN(video.duration)) {
                      setProgressById((prev) => ({ ...prev, [item.id]: 0 }));
                      return;
                    }

                    setProgressById((prev) => ({
                      ...prev,
                      [item.id]: (video.currentTime / video.duration) * 100,
                    }));
                  }}
                  onEnded={() => {
                    if (index === currentIndex) {
                      goToNext();
                    }
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/45" />

                <div className="absolute left-0 right-0 top-0 z-20 px-4 pt-3">
                  <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/25">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href="/"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur"
                    >
                      <ArrowLeft size={18} />
                    </Link>

                    <div className="min-w-0 flex-1 text-center">
                      <p className="truncate text-sm font-medium text-white">
                        {item.title || "ReelUp"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={toggleMute}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur"
                    >
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Previous reel"
                  onClick={() => goToPrevious()}
                  className="absolute left-0 right-0 top-0 z-10 h-1/3"
                />

                <button
                  type="button"
                  aria-label="Next reel"
                  onClick={() => goToNext()}
                  className="absolute bottom-0 left-0 right-0 z-10 h-1/3"
                />

                {item.product ? (
                  <div className="absolute inset-x-0 bottom-0 z-20 p-4 pb-6">
                    <div
                      className="rounded-[24px] bg-white/96 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur"
                      onClick={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchEnd={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-end gap-3">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={item.product.name}
                            className="h-[68px] w-[68px] shrink-0 rounded-[18px] object-cover"
                          />
                        ) : (
                          <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-[18px] bg-[#F3F7F6] text-[11px] text-[#6B8A84]">
                            No image
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 break-words text-[15px] font-semibold leading-5 text-[#12332D]">
                            {item.product.name}
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[15px] font-bold text-[#12332D]">
                              ${item.product.price}
                            </span>

                            {item.product.old_price ? (
                              <span className="text-xs text-[#94A3B8] line-through">
                                ${item.product.old_price}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {itemQuantity > 0 ? (
                          <div className="flex h-[54px] min-w-[122px] shrink-0 items-center justify-between rounded-full bg-[#004F45] px-3 text-white shadow-[0_12px_24px_rgba(0,79,69,0.24)]">
                            <button
                              type="button"
                              onClick={() => {
                                if (!product || !cartItem) return;

                                if (itemQuantity <= 1) {
                                  removeItem(product.id);
                                  return;
                                }

                                changeQuantity(product.id, itemQuantity - 1);
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/14"
                              aria-label="Kamaytirish"
                            >
                              <Minus size={18} />
                            </button>

                            <span className="min-w-[18px] text-center text-[18px] font-bold">
                              {itemQuantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                if (!product) return;
                                if (product.stock <= 0) return;

                                if (!cartItem) {
                                  addItem(product);
                                  return;
                                }

                                if (itemQuantity >= product.stock) return;
                                changeQuantity(product.id, itemQuantity + 1);
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/14"
                              aria-label="Ko'paytirish"
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (!product) return;
                              if (product.stock <= 0) return;
                              addItem(product);
                            }}
                            disabled={!product || product.stock <= 0}
                            aria-label="Savatga qo'shish"
                            className={`flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full text-white ${
                              !product || product.stock <= 0
                                ? "bg-[#AEBCC8]"
                                : "bg-[#004F45] shadow-[0_12px_24px_rgba(0,79,69,0.24)]"
                            }`}
                          >
                            <ShoppingBasket size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}