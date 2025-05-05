"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useToast } from "@/src/hooks/use-toast";

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: Date;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (product: any) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

export const WishlistProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load wishlist when user changes
  useEffect(() => {
    const loadWishlist = async () => {
      if (!user) {
        setWishlist([]);
        return;
      }

      try {
        const wishlistRef = collection(db, "wishlist");
        const wishlistDoc = await getDoc(
          doc(db, `users/${user.uid}/wishlist/items`)
        );

        if (wishlistDoc.exists()) {
          setWishlist(wishlistDoc.data().items || []);
        }
      } catch (error) {
        console.error("Error loading wishlist:", error);
      }
    };

    loadWishlist();
  }, [user]);

  const addToWishlist = async (product: any) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your wishlist",
        variant: "destructive",
      });
      return;
    }

    try {
      const wishlistItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        addedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "wishlist"), {
        ...wishlistItem,
        userId: user.uid,
      });

      setWishlist((prev) => [
        ...prev,
        { ...wishlistItem, id: docRef.id, addedAt: new Date() },
      ]);

      toast({
        title: "Added to Wishlist",
        description: `${product.name} has been added to your wishlist`,
      });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist",
        variant: "destructive",
      });
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, "wishlist", itemId));
      setWishlist((prev) => prev.filter((item) => item.id !== itemId));

      toast({
        title: "Removed from Wishlist",
        description: "Item has been removed from your wishlist",
      });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.productId === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
