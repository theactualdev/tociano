"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: Date;
}

const categories = [
  { id: "women", label: "Women" },
  { id: "men", label: "Men" },
  { id: "accessories", label: "Accessories" },
];

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const colors = ["Red", "Blue", "Green", "White", "Black", "Gold"];
const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-low-high", label: "Price: Low to High" },
  { value: "price-high-low", label: "Price: High to Low" },
  { value: "name-a-z", label: "Name: A to Z" },
  { value: "name-z-a", label: "Name: Z to A" },
];

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  colors: string[];
  sizes: string[];
  isNew: boolean;
  stock: number;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchWishlist = async () => {
      try {
        const q = query(
          collection(db, "wishlist"),
          where("userId", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          addedAt: doc.data().addedAt?.toDate() || new Date(),
        })) as WishlistItem[];

        setWishlistItems(items);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        toast({
          title: "Error",
          description: "Failed to load wishlist items",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user, toast]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"));
        const querySnapshot = await getDocs(q);
        const productsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        console.log("Fetched products:", productsList);

        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      }
    };

    fetchProducts();
  }, [toast]);
  console.log("Products state:", products);

  const removeFromWishlist = async (itemId: string) => {
    try {
      await deleteDoc(doc(db, "wishlist", itemId));
      setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));
      toast({
        title: "Item Removed",
        description: "Item has been removed from your wishlist",
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
    }
  };

  // Filter states
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [sortBy, setSortBy] = useState("newest");

  // Initialize filters from URL params
  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setSelectedCategories([category]);
    }
  }, [searchParams]);

  const filteredProducts = products.filter((product) => {
    if (
      searchQuery &&
      !product.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    if (selectedCategories.length > 0) {
      // Check if product.category matches any selected category (by id or label)
      const categoryMatches = selectedCategories.some(selectedCat => {
        const categoryObj = categories.find(cat => cat.id === selectedCat);
        return selectedCat === product.category || 
               (categoryObj && categoryObj.label.toLowerCase() === product.category?.toLowerCase()) ||
               (categoryObj && categoryObj.id.toLowerCase() === product.category?.toLowerCase());
      });
      
      if (!categoryMatches) {
        return false;
      }
    }

    if (
      selectedSizes.length > 0 &&
      (!product.sizes || !Array.isArray(product.sizes) || !product.sizes.some((size) => selectedSizes.includes(size)))
    ) {
      return false;
    }

    if (
      selectedColors.length > 0 &&
      (!product.colors || !Array.isArray(product.colors) || !product.colors.some((color) => selectedColors.includes(color)))
    ) {
      return false;
    }

    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low-high":
        return a.price - b.price;
      case "price-high-low":
        return b.price - a.price;
      case "name-a-z":
        return a.name.localeCompare(b.name);
      case "name-z-a":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  const handleAddToCart = async (product: Product) => {
    if (product.stock <= 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images[0] || "",
      });

      if (result && result.success) {
        toast({
          title: "Added to Cart",
          description: `${product.name} has been added to your cart`,
        });
      } else {
        toast({
          title: "Error",
          description:
            result?.message ||
            "Failed to add product to cart. It may be out of stock.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    }
  };

  function isInWishlist(id: string) {
    return wishlistItems.some((item) => item.productId === id);
  }

  async function addToWishlist(product: Product) {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to add items to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '',
        userId: user.uid,
        addedAt: new Date(),
      };

      const docRef = collection(db, "wishlist");
      const addedDoc = await addDoc(docRef, newItem);

      setWishlistItems((prev) => [...prev, { id: addedDoc.id, ...newItem }]);
      toast({
        title: "Added to Wishlist",
        description: `${product.name} has been added to your wishlist.`,
      });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">All Products</h1>
          <p className="text-muted-foreground">
            {sortedProducts.length} products found
          </p>
        </div>

        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Button
            variant="outline"
            className="md:hidden"
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside
          className={`
          md:w-64 flex-shrink-0
          ${
            isMobileFiltersOpen
              ? "fixed inset-0 z-50 bg-background p-6 md:relative md:p-0"
              : "hidden md:block"
          }
        `}
        >
          {isMobileFiltersOpen && (
            <div className="flex items-center justify-between mb-6 md:hidden">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileFiltersOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}

          <div className="space-y-6">
            {/* Search */}
            <div>
              <Label>Search</Label>
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Categories */}
            <div>
              <Label className="mb-2 block">Categories</Label>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={(checked) => {
                        setSelectedCategories((prev) =>
                          checked
                            ? [...prev, category.id]
                            : prev.filter((id) => id !== category.id)
                        );
                      }}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="ml-2 text-sm"
                    >
                      {category.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <Label className="mb-2 block">Price Range</Label>
              <div className="px-2 space-y-4">
                {/* Input Fields */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Min</Label>
                    <Input
                      type="number"
                      min={0}
                      max={10000000}
                      value={priceRange[0]}
                      onChange={(e) => {
                        const value = Math.max(0, Math.min(parseInt(e.target.value) || 0, priceRange[1]));
                        setPriceRange([value, priceRange[1]]);
                      }}
                      className="h-8 text-sm"
                      placeholder="Min price"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Max</Label>
                    <Input
                      type="number"
                      min={0}
                      max={10000000}
                      value={priceRange[1]}
                      onChange={(e) => {
                        const value = Math.max(priceRange[0], Math.min(parseInt(e.target.value) || 0, 10000000));
                        setPriceRange([priceRange[0], value]);
                      }}
                      className="h-8 text-sm"
                      placeholder="Max price"
                    />
                  </div>
                </div>
                
                {/* Slider */}
                <Slider
                  value={priceRange}
                  min={0}
                  max={10000000}
                  step={10000}
                  onValueChange={setPriceRange}
                />
                
                {/* Currency Display */}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatCurrency(priceRange[0])}</span>
                  <span>{formatCurrency(priceRange[1])}</span>
                </div>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <Label className="mb-2 block">Sizes</Label>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((size) => (
                  <Button
                    key={size}
                    variant={
                      selectedSizes.includes(size) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => {
                      setSelectedSizes((prev) =>
                        prev.includes(size)
                          ? prev.filter((s) => s !== size)
                          : [...prev, size]
                      );
                    }}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <Label className="mb-2 block">Colors</Label>
              <div className="grid grid-cols-3 gap-2">
                {colors.map((color) => (
                  <Button
                    key={color}
                    variant={
                      selectedColors.includes(color) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => {
                      setSelectedColors((prev) =>
                        prev.includes(color)
                          ? prev.filter((c) => c !== color)
                          : [...prev, color]
                      );
                    }}
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategories([]);
                setSelectedSizes([]);
                setSelectedColors([]);
                setPriceRange([0, 10000000]);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product) => (
              <Card key={product.id} className="group overflow-hidden">
                <Link
                  href={`/products/${product.id}`}
                  className="block relative"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {product.isNew && (
                      <div className="absolute top-2 left-2 bg-accent px-2 py-1 text-xs font-semibold rounded">
                        New
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-medium hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="text-lg font-semibold text-primary mt-1">
                    {formatCurrency(product.price)}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      className="flex-1"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (isInWishlist(product.id)) {
                          const wishlistItem = wishlistItems.find(
                            (item) => item.productId === product.id
                          );
                          if (wishlistItem) {
                            removeFromWishlist(wishlistItem.id);
                          }
                        } else {
                          addToWishlist(product);
                        }
                      }}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isInWishlist(product.id)
                            ? "fill-primary text-primary"
                            : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {sortedProducts.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={<div className="container mx-auto px-4 py-16">Loading...</div>}
    >
      <ProductsContent />
    </Suspense>
  );
}
