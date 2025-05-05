import Link from "next/link";
import Image from "next/image";
import { AspectRatio } from "@/src/components/ui/aspect-ratio";

const categories = [
  {
    name: "Women",
    image: "https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg",
    description: "Elegant dresses, tops, and more",
    href: "/category/women",
  },
  {
    name: "Men",
    image: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg",
    description: "Stylish suits and traditional wear",
    href: "/category/men",
  },
  {
    name: "Accessories",
    image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg",
    description: "Jewelry, bags, and finishing touches",
    href: "/category/accessories",
  },
];

export function Categories() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our curated collection of Nigerian-inspired fashion and
            accessories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ category }: { category: any }) {
  return (
    <Link
      href={category.href}
      className="group overflow-hidden rounded-lg relative block transform transition-all duration-500 hover:-translate-y-2"
    >
      <AspectRatio ratio={1 / 1} className="bg-muted">
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h3 className="text-2xl font-bold mb-1">{category.name}</h3>
          <p className="text-white/80">{category.description}</p>
          <div className="mt-4 inline-block border-b border-white pb-1 transform translate-x-0 group-hover:translate-x-1 transition-transform">
            Shop Now
          </div>
        </div>
      </AspectRatio>
    </Link>
  );
}
