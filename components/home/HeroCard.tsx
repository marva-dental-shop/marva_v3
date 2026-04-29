import Link from "next/link";
import Image from "next/image";

export function HeroCard() {
  return (
    <section className="overflow-hidden rounded-[28px] bg-marva-700 text-white shadow-soft">
      <div className="relative p-5">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-marva-500/30 blur-3xl" />
        <div className="flex items-start justify-between gap-3">
          <div className="max-w-[68%]">
            <p className="text-xs uppercase tracking-[0.24em] text-marva-100">Medical premium style</p>
            <h2 className="mt-2 text-2xl font-bold leading-tight">Dental material va uskunalar bir joyda</h2>
            <p className="mt-3 text-sm text-marva-100/90">Telegram Mini App ichida tez buyurtma, katalog va savatcha.</p>
            <div className="mt-4 flex gap-2">
              <Link href="/catalog" className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-marva-800">
                Katalogni ko‘rish
              </Link>
              <Link href="/auth" className="rounded-2xl border border-white/30 px-4 py-3 text-sm font-semibold text-white">
                Kirish
              </Link>
            </div>
          </div>
          <div className="rounded-[24px] bg-white/10 p-3">
            <Image src="/logo.png" alt="MARVA logo" width={88} height={88} className="h-20 w-20 object-contain" />
          </div>
        </div>
      </div>
    </section>
  );
}
