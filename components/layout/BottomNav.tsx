"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid2X2, Play, ShoppingCart, User } from "lucide-react";
import { useAppLang } from "@/components/common/LangProvider";
import { getActiveReelUpItems, type ReelUpItem } from "@/lib/reelsup";

const VIEWED_REELUP_KEY = "marva-viewed-reel-ids";

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

export function BottomNav() {
  const pathname = usePathname();
  const { lang, mounted } = useAppLang();

  const [reelUpItems, setReelUpItems] = useState<ReelUpItem[]>([]);
  const [viewedReelUpIds, setViewedReelUpIds] = useState<number[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadReelUpItems() {
      try {
        const data = await getActiveReelUpItems();
        if (!isMounted) return;
        setReelUpItems(data);
      } catch (error) {
        console.error("Failed to load ReelUp items in BottomNav:", error);
        if (!isMounted) return;
        setReelUpItems([]);
      }
    }

    void loadReelUpItems();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setViewedReelUpIds(getViewedReelUpIds());

    const syncViewed = () => {
      setViewedReelUpIds(getViewedReelUpIds());
    };

    window.addEventListener("focus", syncViewed);
    window.addEventListener("storage", syncViewed);

    return () => {
      window.removeEventListener("focus", syncViewed);
      window.removeEventListener("storage", syncViewed);
    };
  }, []);

  const hasUnseenReelUp = useMemo(() => {
    if (!reelUpItems.length) return false;
    return reelUpItems.some((item) => !viewedReelUpIds.includes(item.id));
  }, [reelUpItems, viewedReelUpIds]);

  if (!mounted) return null;

  const items = [
    {
      href: "/",
      label: lang === "uz" ? "Home" : "Главная",
      icon: Home,
    },
    {
      href: "/catalog",
      label: lang === "uz" ? "Katalog" : "Каталог",
      icon: Grid2X2,
    },
    {
      href: "/reels",
      label: "ReelUp",
      icon: Play,
      isSpecial: true,
    },
    {
      href: "/cart",
      label: lang === "uz" ? "Savat" : "Корзина",
      icon: ShoppingCart,
    },
    {
      href: "/profile",
      label: lang === "uz" ? "Profil" : "Профиль",
      icon: User,
    },
  ];

  const isItemActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        paddingBottom:
          "max(env(safe-area-inset-bottom, 0px), var(--tg-safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="mx-auto max-w-md px-3 pb-2">
        <div className="rounded-[30px] border border-black/5 bg-white/95 px-2 py-2 shadow-[0_18px_40px_rgba(15,23,42,0.10)] backdrop-blur-xl">
          <div className="grid grid-cols-5 items-end gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);
              const isSpecial = item.isSpecial;

              if (isSpecial) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center justify-end"
                  >
                    <div className="-mt-6 flex flex-col items-center">
                      <div
                        className={`relative flex h-[48px] w-[48px] items-center justify-center rounded-full transition-all duration-200 ${
                          active
                            ? "bg-[linear-gradient(135deg,#DC2626_0%,#B91C1C_100%)] text-white shadow-[0_16px_28px_rgba(220,38,38,0.34)] ring-4 ring-white"
                            : "bg-[linear-gradient(135deg,#F87171_0%,#DC2626_100%)] text-white shadow-[0_14px_24px_rgba(220,38,38,0.28)] ring-4 ring-white"
                        }`}
                      >
                        <div className="absolute inset-[5px] rounded-full border border-white/20" />
                        <Icon size={18} strokeWidth={2.5} className="relative z-[1]" />

                        {hasUnseenReelUp && !active ? (
                          <span className="absolute right-0 top-0 z-[2] h-3 w-3 rounded-full bg-[#22C55E] ring-2 ring-white" />
                        ) : null}
                      </div>

                      <span
                        className={`mt-1 text-[10px] font-semibold ${
                          active ? "text-[#B91C1C]" : "text-[#DC2626]"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-[64px] flex-col items-center justify-center rounded-[18px] px-2 py-2 transition-all duration-200 ${
                    active
                      ? "bg-[#004F45] text-white shadow-[0_14px_28px_rgba(0,79,69,0.22)] ring-1 ring-white/10"
                      : "text-[#4F6F69]"
                  }`}
                >
                  <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full">
                    <Icon size={20} strokeWidth={2.2} />
                  </div>

                  <span className="text-center text-[11px] font-medium">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}