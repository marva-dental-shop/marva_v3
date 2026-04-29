import type { Category, Product } from "@/lib/types";

export const categories: Category[] = [
  {
    id: "cat-plomba",
    name: "Plombalar",
    slug: "plombalar",
    icon: "🦷",
    description: "Kompozit, flow va restavratsiya materiallari"
  },
  {
    id: "cat-ortopedia",
    name: "Ortopedia",
    slug: "ortopedia",
    icon: "🧩",
    description: "Koronka va ortopedik sarf materiallar"
  },
  {
    id: "cat-instrument",
    name: "Instrumentlar",
    slug: "instrumentlar",
    icon: "🛠️",
    description: "Stomatologik instrument va aksessuarlar"
  },
  {
    id: "cat-endo",
    name: "Endodontiya",
    slug: "endodontiya",
    icon: "🧪",
    description: "Kanal uchun dori va sarf materiallar"
  },
  {
    id: "cat-bor",
    name: "Bor",
    slug: "bor",
    icon: "⚙️",
    description: "Bor va freza mahsulotlari"
  },
  {
    id: "cat-chair",
    name: "Kreslo",
    slug: "kreslo",
    icon: "💺",
    description: "Dental unit va kreslo modellari"
  }
];

export const products: Product[] = [
  {
    id: "p1",
    slug: "quadrant-flow-a2",
    categoryId: "cat-plomba",
    name: "Quadrant Flow A2",
    price: 6.5,
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&q=80",
    badge: "Top",
    shortDescription: "Flow plomba materiali",
    description: "Yengil oqimli kompozit plomba materiali. Kundalik stomatologik ishlarda qulay variant.",
    stock: 14,
    featured: true
  },
  {
    id: "p2",
    slug: "i-dental-i-xcite-lc-4g",
    categoryId: "cat-plomba",
    name: "i-dental i-XCITE LC N 4g",
    price: 10,
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Universal kompozit",
    description: "4 grammlik universal kompozit. Klinik ishlar uchun mos.",
    stock: 20,
    featured: true
  },
  {
    id: "p3",
    slug: "charizma-4g",
    categoryId: "cat-plomba",
    name: "Charizma 4g",
    price: 13,
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Mashhur restavratsion kompozit",
    description: "Restavratsiya uchun ommabop kompozit. Sifat va narx balansi yaxshi.",
    stock: 11,
    featured: true
  },
  {
    id: "p4",
    slug: "estelite-palfique",
    categoryId: "cat-plomba",
    name: "Estelite Palfique",
    price: 24,
    image: "https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Premium plomba materiali",
    description: "Estetik natija uchun premium kompozit variant.",
    stock: 9,
    featured: false
  },
  {
    id: "p5",
    slug: "easycord",
    categoryId: "cat-ortopedia",
    name: "EasyCord",
    price: 11,
    image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Ortopedik yordamchi material",
    description: "Ortopedik ishlar uchun kerakli yordamchi material.",
    stock: 18,
    featured: false
  },
  {
    id: "p6",
    slug: "shtift",
    categoryId: "cat-ortopedia",
    name: "Shtift",
    price: 2,
    image: "https://images.unsplash.com/photo-1583947582886-f40ec95dd752?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Ortopedik shtift",
    description: "Har xil klinik holatlar uchun ishlatiladigan shtift.",
    stock: 50,
    featured: false
  },
  {
    id: "p7",
    slug: "shiptsi",
    categoryId: "cat-instrument",
    name: "Shiptsi",
    price: 13,
    image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Stomatologik qisqich",
    description: "Jarayonlarda ishlatiladigan instrument.",
    stock: 16,
    featured: false
  },
  {
    id: "p8",
    slug: "elevator",
    categoryId: "cat-instrument",
    name: "Elevator",
    price: 9,
    image: "https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Dental elevator",
    description: "Dental amaliyot uchun elevator instrumenti.",
    stock: 12,
    featured: false
  },
  {
    id: "p9",
    slug: "gipoxloran-3",
    categoryId: "cat-endo",
    name: "Gipoxloran-3",
    price: 20,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Endodontik eritma",
    description: "Kanal tozalash uchun ishlatiladigan endodontik suyuqlik.",
    stock: 22,
    featured: false
  },
  {
    id: "p10",
    slug: "yodoform",
    categoryId: "cat-endo",
    name: "Yodoform",
    price: 7,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Endo sarf materiali",
    description: "Endodontik ishlarda qo‘llaniladigan yodoform mahsuloti.",
    stock: 28,
    featured: false
  },
  {
    id: "p11",
    slug: "mani-stainless-burs-hard",
    categoryId: "cat-bor",
    name: "Mani Stainless Burs Hard",
    price: 18,
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Qattiq bor to‘plami",
    description: "Stomatologik ishlov uchun qattiq stainless bor.",
    stock: 15,
    featured: false
  },
  {
    id: "p12",
    slug: "cx-9000-up",
    categoryId: "cat-chair",
    name: "CX 9000 UP",
    price: 3150,
    image: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=900&q=80",
    badge: "Premium",
    shortDescription: "Dental kreslo komplekti",
    description: "Kompressor, nakonechnik joylari va vrach stuli bilan dental unit.",
    stock: 3,
    featured: true
  },
  {
    id: "p13",
    slug: "cx-9000-down",
    categoryId: "cat-chair",
    name: "CX 9000 DOWN",
    price: 2828,
    image: "https://images.unsplash.com/photo-1666214280560-6658b5f1f95f?auto=format&fit=crop&w=900&q=80",
    shortDescription: "Dental kreslo",
    description: "MARVA katalogidagi mashhur kreslo modeli.",
    stock: 4,
    featured: true
  },
  {
    id: "p14",
    slug: "wenbang-g1",
    categoryId: "cat-chair",
    name: "WENBANG G1",
    price: 3580,
    image: "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=900&q=80",
    shortDescription: "WENBANG dental unit",
    description: "Yetkazib berish va servis uchun qulay premium model.",
    stock: 2,
    featured: true
  },
  {
    id: "p15",
    slug: "wenbang-g7",
    categoryId: "cat-chair",
    name: "WENBANG G7",
    price: 5052,
    image: "https://images.unsplash.com/photo-1666214280391-8ff5bd3f8d16?auto=format&fit=crop&w=900&q=80",
    badge: "Flagman",
    shortDescription: "Top dental kreslo",
    description: "Keng funksional va premium segmentdagi dental kreslo.",
    stock: 1,
    featured: true
  }
];

export const featuredProducts = products.filter((product) => product.featured);

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}
