export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  rating: number;
  reviews: number;
  discount?: number;
  image: string;
  description: string;
  features: string[];
};

export const products: Product[] = [
  {
    id: "aurora-lamp",
    name: "Aurora Ceramic Lamp",
    price: 129,
    discount: 15,
    category: "Home",
    rating: 4.8,
    reviews: 214,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop",
    description: "A hand-thrown ceramic table lamp with a warm linen shade. Casts a soft, sunset glow that transforms any corner into a moment.",
    features: ["Hand-glazed ceramic base", "Linen drum shade", "Dimmable LED bulb included", "1.8m braided cord"],
  },
  {
    id: "field-tote",
    name: "Field Canvas Tote",
    price: 68,
    category: "Bags",
    rating: 4.7,
    reviews: 512,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop",
    description: "Heavyweight 18oz canvas tote with saddle-stitched leather handles. Built for market runs, weekend hauls, and everything between.",
    features: ["18oz waxed canvas", "Vegetable-tanned leather handles", "Interior zip pocket", "Fits a 15\" laptop"],
  },
  {
    id: "mineral-mug",
    name: "Mineral Stoneware Mug",
    price: 24,
    discount: 20,
    category: "Kitchen",
    rating: 4.9,
    reviews: 890,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&auto=format&fit=crop",
    description: "Speckled stoneware mug with a rounded, hand-friendly silhouette. Holds 12oz of your morning ritual.",
    features: ["Reactive glaze — each is unique", "12oz capacity", "Microwave & dishwasher safe", "Set of 2"],
  },
  {
    id: "trailrunner-sneaker",
    name: "Trailrunner Low",
    price: 158,
    category: "Footwear",
    rating: 4.6,
    reviews: 341,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop",
    description: "A city sneaker with trail DNA. Grippy Vibram outsole, breathable knit upper, and a cork footbed that molds to you.",
    features: ["Vibram Megagrip outsole", "Recycled knit upper", "Cork + latex footbed", "Weighs 260g"],
  },
  {
    id: "linen-throw",
    name: "Washed Linen Throw",
    price: 89,
    category: "Home",
    rating: 4.8,
    reviews: 176,
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop",
    description: "Stone-washed European linen throw, softer than the day you got it. Drapes beautifully over a sofa or the foot of a bed.",
    features: ["100% European flax linen", "Stone-washed for softness", "130 x 180 cm", "Oeko-Tex certified"],
  },
  {
    id: "pocket-notebook",
    name: "Pocket Field Notebook",
    price: 18,
    category: "Stationery",
    rating: 4.9,
    reviews: 1204,
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&auto=format&fit=crop",
    description: "Pack of three pocket notebooks with dot-grid pages and a stitched spine. For lists, sketches, and half-formed ideas.",
    features: ["3-pack", "Dot-grid, 64 pages each", "Stitched spine, lies flat", "Recycled kraft cover"],
  },
  {
    id: "brass-kettle",
    name: "Brass Pour-Over Kettle",
    price: 96,
    discount: 10,
    category: "Kitchen",
    rating: 4.7,
    reviews: 298,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop",
    description: "A gooseneck kettle in solid brass. Precision pour, patina that gets better with age.",
    features: ["Solid brass body", "Gooseneck for control", "0.9L capacity", "Stovetop compatible"],
  },
  {
    id: "wool-cardigan",
    name: "Weekday Wool Cardigan",
    price: 184,
    category: "Apparel",
    rating: 4.5,
    reviews: 402,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop",
    description: "Chunky merino cardigan knit in Portugal. The one you'll reach for from October through April.",
    features: ["100% merino wool", "Horn buttons", "Ribbed cuffs & hem", "Unisex fit"],
  },
];

export function priceAfterDiscount(p: Product) {
  return p.discount ? Math.round(p.price * (1 - p.discount / 100)) : p.price;
}
