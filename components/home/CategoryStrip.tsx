import Link from "next/link";
import { categories } from "@/data/products";

export function CategoryStrip() {
  return (
    <div className="hide-scrollbar -mx-4 overflow-x-auto px-4">
      <div className="flex gap-3 pb-1">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/catalog?category=${category.slug}`}
            className="min-w-[108px] rounded-[22px] border border-marva-100 bg-white p-4 shadow-soft"
          >
            <div className="text-2xl">{category.icon}</div>
            <p className="mt-3 text-sm font-semibold text-marva-900">{category.name}</p>
            <p className="mt-1 text-xs text-marva-700/70">{category.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
