"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/src/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,@/src/components/ui/button
  query,@/src/components/ui/card
  where,
  getDocs,@/src/context/CartContext
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/src/hooks/use-toast";

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: Date;
}

export default function WishlistPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      id: item.productId,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    });

    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart`,
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to view your wishlist
          </p>
          <Button asChild>
            <Link href="/login?redirect=/wishlist">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Your Wishlist is Empty</h1>
          <p className="text-muted-foreground mb-6">
            Browse our products and add your favorites to your wishlist
          </p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-8">My Wishlist</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-4">
              <h3 className="font-semibold mb-2">{item.name}</h3>
              <p className="text-lg font-bold text-primary mb-4">
                {formatCurrency(item.price)}
              </p>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => handleAddToCart(item)}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeFromWishlist(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
