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
import type { Product, Reel } from "@/lib/types";

type ReelsViewerModalProps = {
  isOpen: boolean;
  reels: Reel[];
  initialIndex?: number;
  onCloseAction: () => void;
  onReelViewedAction?: (reelId: number) => void;
};

function getReelProductImage(reel?: Reel | null) {
  if (!reel?.product) return "";
  return reel.product.images?.[0] || reel.product.image_url || "";
}

function mapReelToCartProduct(reel?: Reel | null): Product | null {
  if (!reel?.product) return null;

  const image = reel.product.images?.[0] || reel.product.image_url || "";

  return {
    id: String(reel.product.id),
    slug: `product-${reel.product.id}`,
    categoryId: reel.product.category_id
      ? String(reel.product.category_id)
      : "",
    name: reel.product.name,
    price: Number(reel.product.price || 0),
    oldPrice: reel.product.old_price
      ? Number(reel.product.old_price)
      : undefined,
    currency: "USD",
    image,
    shortDescription: reel.product.description || "Dental mahsulot",
    description:
      reel.product.full_description ||
      reel.product.description ||
      "Dental mahsulot",
    stock: Number(reel.product.stock ?? 0),
    featured: Boolean(reel.product.is_featured),
  };
}

function getSafeInitialIndex(initialIndex: number | undefined, reels: Reel[]) {
  if (!reels.length) return 0;
  if (typeof initialIndex !== "number" || Number.isNaN(initialIndex)) return 0;
  return Math.min(Math.max(initialIndex, 0), reels.length - 1);
}

export default function ReelsViewerModal({
  isOpen,
  reels,
  initialIndex = 0,
  onCloseAction,
  onReelViewedAction,
}: ReelsViewerModalProps) {
  const { items, addItem, changeQuantity, removeItem } = useCartStore();

  const [currentIndex, setCurrentIndex] = useState(
    getSafeInitialIndex(initialIndex, reels)
  );
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const currentReel = useMemo(() => reels[currentIndex], [reels, currentIndex]);
  const currentProductImage = useMemo(
    () => getReelProductImage(currentReel),
    [currentReel]
  );
  const currentCartProduct = useMemo(
    () => mapReelToCartProduct(currentReel),
    [currentReel]
  );

  const cartItem = useMemo(() => {
    if (!currentCartProduct) return undefined;
    return items.find((item) => item.product.id === currentCartProduct.id);
  }, [items, currentCartProduct]);

  const quantity = cartItem?.quantity || 0;

  const goToNext = () => {
    if (currentIndex < reels.length - 1) {
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

  const pauseVideo = () => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    setIsPaused(true);
  };

  const resumeVideo = () => {
    const video = videoRef.current;
    if (!video) return;

    void video.play().catch((error) => {
      console.error("Failed to resume reel video:", error);
    });

    setIsPaused(false);
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
        console.error("Failed to play reel video after unmute:", error);
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
      setCurrentIndex(getSafeInitialIndex(initialIndex, reels));
      setIsVideoLoading(true);
      setProgress(0);
      setIsPaused(false);
      return;
    }

    setCurrentIndex(getSafeInitialIndex(initialIndex, reels));
    setIsMuted(false);
  }, [isOpen, initialIndex, reels]);

  useEffect(() => {
    if (!reels.length) return;
    setCurrentIndex((prev) => Math.min(prev, reels.length - 1));
  }, [reels]);

  useEffect(() => {
    if (!isOpen || !currentReel) return;

    setIsVideoLoading(true);
    setProgress(0);
    setIsPaused(false);

    onReelViewedAction?.(currentReel.id);
  }, [isOpen, currentReel, onReelViewedAction]);

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

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseAction();
        return;
      }

      if (event.key === "ArrowDown") {
        goToNext();
        return;
      }

      if (event.key === "ArrowUp") {
        goToPrevious();
        return;
      }

      if (event.key === " ") {
        event.preventDefault();

        if (videoRef.current?.paused) {
          resumeVideo();
        } else {
          pauseVideo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, currentIndex, reels.length, onCloseAction]);

  if (!isOpen || reels.length === 0 || !currentReel) {
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
              key={currentReel.id}
              ref={videoRef}
              src={currentReel.video_url}
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
                  console.error("Failed to autoplay reel video:", error);
                });
              }}
              onTimeUpdate={(event) => {
                const video = event.currentTarget;

                if (!video.duration || Number.isNaN(video.duration)) {
                  setProgress(0);
                  return;
                }

                const nextProgress = (video.currentTime / video.duration) * 100;
                setProgress(nextProgress);
              }}
              onEnded={goToNext}
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55" />
          </div>

          <div className="absolute left-0 right-0 top-0 z-20 px-3 pt-3">
            <div className="mb-3 flex items-center gap-1">
              {reels.map((reel, index) => {
                let widthClass = "w-0";

                if (index < currentIndex) {
                  widthClass = "w-full";
                } else if (index === currentIndex) {
                  widthClass = "";
                }

                return (
                  <div
                    key={reel.id}
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
                {currentReel.title ? (
                  <p className="truncate text-sm font-medium text-white">
                    {currentReel.title}
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

          <div className="absolute inset-0 z-10">
            <button
              type="button"
              aria-label="Previous reel"
              onClick={goToPrevious}
              className="absolute left-0 top-0 h-1/3 w-full"
            />

            <button
              type="button"
              aria-label="Next reel"
              onClick={goToNext}
              className="absolute bottom-0 left-0 h-1/3 w-full"
            />

            <div
              className="absolute left-0 right-0 top-1/3 h-1/3"
              onMouseDown={pauseVideo}
              onMouseUp={resumeVideo}
              onMouseLeave={resumeVideo}
            />
          </div>

          {isVideoLoading && (
            <div className="absolute inset-0 z-[30] flex items-center justify-center bg-black/35 text-white">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          )}

          {currentReel.product ? (
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
                      alt={currentReel.product.name}
                      className="h-[72px] w-[72px] shrink-0 rounded-[20px] object-cover"
                    />
                  ) : (
                    <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[20px] bg-[#F3F7F6] text-[11px] text-[#6B8A84]">
                      No image
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 break-words text-[17px] font-bold leading-5 text-[#12332D]">
                      {currentReel.product.name}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[16px] font-extrabold text-[#004F45]">
                        ${currentReel.product.price}
                      </span>

                      {currentReel.product.old_price ? (
                        <span className="text-xs text-[#94A3B8] line-through">
                          ${currentReel.product.old_price}
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

          {isPaused && !isVideoLoading && (
            <div className="pointer-events-none absolute inset-0 z-[26] flex items-center justify-center bg-black/10">
              <div className="rounded-full bg-black/40 px-4 py-2 text-sm font-medium text-white">
                Pause
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
