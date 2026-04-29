"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Minus,
  Plus,
  ShoppingBasket,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useCartStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import type { ReelUpItem } from "@/lib/reelsup";

type ReelUpViewerModalProps = {
  isOpen: boolean;
  items: ReelUpItem[];
  initialIndex?: number;
  onCloseAction: () => void;
  onItemViewedAction?: (itemId: number) => void;
};

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

function getSafeInitialIndex(
  initialIndex: number | undefined,
  items: ReelUpItem[]
) {
  if (!items.length) return 0;
  if (typeof initialIndex !== "number" || Number.isNaN(initialIndex)) return 0;
  return Math.min(Math.max(initialIndex, 0), items.length - 1);
}

export default function ReelUpViewerModal({
  isOpen,
  items,
  initialIndex = 0,
  onCloseAction,
  onItemViewedAction,
}: ReelUpViewerModalProps) {
  const { items: cartItems, addItem, changeQuantity, removeItem } = useCartStore();

  const [currentIndex, setCurrentIndex] = useState(
    getSafeInitialIndex(initialIndex, items)
  );
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const currentItem = useMemo(() => items[currentIndex], [items, currentIndex]);
  const currentProductImage = useMemo(
    () => getProductImage(currentItem),
    [currentItem]
  );
  const currentCartProduct = useMemo(
    () => mapToCartProduct(currentItem),
    [currentItem]
  );

  const cartItem = useMemo(() => {
    if (!currentCartProduct) return undefined;
    return cartItems.find((item) => item.product.id === currentCartProduct.id);
  }, [cartItems, currentCartProduct]);

  const quantity = cartItem?.quantity || 0;

  const goToNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    onCloseAction();
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    const nextMuted = !isMuted;

    setIsMuted(nextMuted);

    if (!video) return;
    video.muted = nextMuted;

    if (!nextMuted) {
      video.volume = 1;
      void video.play().catch((error) => {
        console.error("Failed to play ReelUp video after unmute:", error);
      });
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartYRef.current === null || touchStartXRef.current === null) {
      touchStartYRef.current = null;
      touchStartXRef.current = null;
      return;
    }

    const endY = event.changedTouches[0]?.clientY ?? touchStartYRef.current;
    const endX = event.changedTouches[0]?.clientX ?? touchStartXRef.current;

    const deltaY = endY - touchStartYRef.current;
    const deltaX = endX - touchStartXRef.current;

    touchStartYRef.current = null;
    touchStartXRef.current = null;

    if (Math.abs(deltaY) < 60) return;
    if (Math.abs(deltaY) <= Math.abs(deltaX)) return;

    if (deltaY < 0) {
      goToNext();
      return;
    }

    goToPrevious();
  };

  const handleAddToCart = () => {
    if (!currentCartProduct) return;
    if (currentCartProduct.stock <= 0) return;
    addItem(currentCartProduct);
  };

  const increase = () => {
    if (!currentCartProduct) return;
    if (currentCartProduct.stock <= 0) return;

    if (!cartItem) {
      addItem(currentCartProduct);
      return;
    }

    if (quantity >= currentCartProduct.stock) return;
    changeQuantity(currentCartProduct.id, quantity + 1);
  };

  const decrease = () => {
    if (!currentCartProduct || !cartItem) return;

    if (quantity <= 1) {
      removeItem(currentCartProduct.id);
      return;
    }

    changeQuantity(currentCartProduct.id, quantity - 1);
  };

  useEffect(() => {
    if (!isOpen) {
      setCurrentIndex(getSafeInitialIndex(initialIndex, items));
      setIsVideoLoading(true);
      setProgress(0);
      return;
    }

    setCurrentIndex(getSafeInitialIndex(initialIndex, items));
    setIsMuted(false);
  }, [isOpen, initialIndex, items]);

  useEffect(() => {
    if (!items.length) return;
    setCurrentIndex((prev) => Math.min(prev, items.length - 1));
  }, [items]);

  useEffect(() => {
    if (!isOpen || !currentItem) return;

    setIsVideoLoading(true);
    setProgress(0);
    onItemViewedAction?.(currentItem.id);
  }, [isOpen, currentItem, onItemViewedAction]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
    if (!isMuted) {
      video.volume = 1;
    }
  }, [isMuted, currentIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen || items.length === 0 || !currentItem) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/92">
      <div className="flex min-h-screen items-center justify-center px-3 py-3">
        <div
          className="relative w-full max-w-[390px] overflow-hidden rounded-[30px] bg-black shadow-2xl"
          style={{ aspectRatio: "9 / 16" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="absolute inset-0">
            <video
              key={currentItem.id}
              ref={videoRef}
              src={currentItem.video_url}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted={isMuted}
              playsInline
              preload="auto"
              controls={false}
              onLoadedMetadata={() => {
                setProgress(0);
              }}
              onCanPlay={() => {
                setIsVideoLoading(false);

                const video = videoRef.current;
                if (!video) return;

                video.muted = isMuted;

                if (!isMuted) {
                  video.volume = 1;
                }

                void video.play().catch((error) => {
                  console.error("Failed to autoplay ReelUp video:", error);
                });
              }}
              onTimeUpdate={(event) => {
                const video = event.currentTarget;

                if (!video.duration || Number.isNaN(video.duration)) {
                  setProgress(0);
                  return;
                }

                setProgress((video.currentTime / video.duration) * 100);
              }}
              onEnded={goToNext}
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55" />
          </div>

          <div className="absolute left-0 right-0 top-0 z-20 px-3 pt-3">
            <div className="mb-3 flex items-center gap-1">
              {items.map((item, index) => {
                let widthClass = "w-0";

                if (index < currentIndex) {
                  widthClass = "w-full";
                } else if (index === currentIndex) {
                  widthClass = "";
                }

                return (
                  <div
                    key={item.id}
                    className="h-1 flex-1 overflow-hidden rounded-full bg-white/25"
                  >
                    <div
                      className={`h-full rounded-full bg-white transition-all duration-150 ${
                        index === currentIndex ? "" : widthClass
                      }`}
                      style={
                        index === currentIndex
                          ? { width: `${progress}%` }
                          : undefined
                      }
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onCloseAction}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-full bg-black/45 px-4 py-2 text-sm font-medium text-white backdrop-blur"
              >
                <X size={16} />
                Yopish
              </button>

              <div className="min-w-0 flex-1 text-center">
                {currentItem.title ? (
                  <p className="truncate text-sm font-medium text-white">
                    {currentItem.title}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={toggleMute}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          </div>

          {isVideoLoading && (
            <div className="absolute inset-0 z-[30] flex items-center justify-center bg-black/35 text-white">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          )}

          {currentItem.product ? (
            <div className="absolute inset-x-0 bottom-0 z-[25] p-4">
              <div
                className="pointer-events-auto rounded-[26px] bg-white/96 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                <div className="flex items-end gap-3">
                  {currentProductImage ? (
                    <img
                      src={currentProductImage}
                      alt={currentItem.product.name}
                      className="h-[72px] w-[72px] shrink-0 rounded-[20px] object-cover"
                    />
                  ) : (
                    <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[20px] bg-[#F3F7F6] text-[11px] text-[#6B8A84]">
                      No image
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 break-words text-[17px] font-bold leading-5 text-[#12332D]">
                      {currentItem.product.name}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[16px] font-extrabold text-[#004F45]">
                        ${currentItem.product.price}
                      </span>

                      {currentItem.product.old_price ? (
                        <span className="text-xs text-[#94A3B8] line-through">
                          ${currentItem.product.old_price}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {quantity > 0 ? (
                    <div className="flex h-[58px] min-w-[126px] shrink-0 items-center justify-between rounded-full bg-[#004F45] px-3 text-white shadow-[0_12px_24px_rgba(0,79,69,0.24)]">
                      <button
                        type="button"
                        onClick={decrease}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/14"
                        aria-label="Kamaytirish"
                      >
                        <Minus size={20} />
                      </button>

                      <span className="min-w-[18px] text-center text-[18px] font-bold">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={increase}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/14"
                        aria-label="Ko'paytirish"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={!currentCartProduct || currentCartProduct.stock <= 0}
                      aria-label="Savatga qo'shish"
                      className={`flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full text-white transition-all ${
                        !currentCartProduct || currentCartProduct.stock <= 0
                          ? "bg-[#AEBCC8]"
                          : "bg-[#004F45] shadow-[0_12px_24px_rgba(0,79,69,0.24)]"
                      }`}
                    >
                      <ShoppingBasket size={22} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}