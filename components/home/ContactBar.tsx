import { Phone, MessageCircle } from "lucide-react";

export function ContactBar() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <a href="tel:+998994113020" className="rounded-[24px] bg-white p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-marva-100 p-3 text-marva-800">
            <Phone size={18} />
          </div>
          <div>
            <p className="text-xs text-marva-700/70">Qo‘ng‘iroq</p>
            <p className="font-semibold text-marva-900">+998 99 411 30 20</p>
          </div>
        </div>
      </a>
      <a href="https://t.me/marva_dental_shop" className="rounded-[24px] bg-white p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-marva-100 p-3 text-marva-800">
            <MessageCircle size={18} />
          </div>
          <div>
            <p className="text-xs text-marva-700/70">Telegram</p>
            <p className="font-semibold text-marva-900">@marva_dental_shop</p>
          </div>
        </div>
      </a>
    </div>
  );
}
