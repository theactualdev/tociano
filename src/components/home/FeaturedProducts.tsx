"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AspectRatio } from "@/src/components/ui/aspect-ratio";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCart, CartItem } from "@/src/context/CartContext";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Generate a random array of 4 unique numbers between 1 and the length of featuredProducts
const getRandomProductIds = (count: number, max: number) => {
  const ids = new Set<number>();
  while (ids.size < count) {
    ids.add(Math.floor(Math.random() * max) + 1);
  }
  return Array.from(ids);
};

export function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const productsRef = collection(db, "products");
        const querySnapshot = await getDocs(productsRef);

        const allProducts: Product[] = [];
        querySnapshot.forEach((doc) => {
          allProducts.push(doc.data() as Product);
        });

        // Shuffle the array and pick the first 4 products
        const shuffledProducts = allProducts.sort(() => 0.5 - Math.random());
        const selectedProducts = shuffledProducts.slice(0, 4);

        setFeaturedProducts(selectedProducts);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
            <p className="text-muted-foreground">
              Discover our most popular designs
            </p>
          </div>
          <Link
            href="/products"
            className="text-primary hover:underline mt-4 md:mt-0"
          >
            View All Products
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string;
  category: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images,
    };

    addToCart(cartItem);
  };

  return (
    <Card className="group overflow-hidden border-border hover:border-primary/50 transition-all duration-300">
      <div
        className="relative product-image-zoom"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AspectRatio ratio={3 / 4}>
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.isNew && (
            <div className="absolute top-2 left-2 bg-accent px-2 py-1 text-xs font-semibold rounded">
              New
            </div>
          )}
        </AspectRatio>

        {/* Product actions overlay */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full"
          >
            <Heart className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full"
            asChild
          >
            <Link href={`/products/${product.id}`}>
              <Eye className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="font-medium hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="text-lg font-semibold text-primary mt-1">
          {formatCurrency(product.price)}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          className="w-full bg-secondary hover:bg-primary hover:text-white transition-colors"
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
