"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  query,
  collection,
  getDocs,
} from "firebase/firestore";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    item: CartItem
  ) => Promise<{ success: boolean; message?: string }>;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();

  // Calculate subtotal
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Load cart from local storage or Firestore when component mounts
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        // Load cart from Firestore if user is logged in
        const cartDoc = await getDoc(doc(db, "carts", user.uid));
        if (cartDoc.exists()) {
          setCart(cartDoc.data().items || []);
        }
      } else {
        // Load cart from local storage if user is not logged in
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      }
    };

    loadCart();
  }, [user]);

  // Save cart to local storage or Firestore when cart changes
  useEffect(() => {
    const saveCart = async () => {
      if (user) {
        // Save cart to Firestore if user is logged in
        await setDoc(
          doc(db, "carts", user.uid),
          {
            items: cart,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } else {
        // Save cart to local storage if user is not logged in
        localStorage.setItem("cart", JSON.stringify(cart));
      }
    };

    if (cart.length > 0) {
      saveCart();
    }
  }, [cart, user]);

  // Add item to cart
  const addToCart = async (
    item: CartItem
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log("Adding item to cart:", item);

      // Add to cart
      setCart((prev) => {
        // Check if item already exists in cart (matching id, size, color)
        const existingItemIndex = prev.findIndex(
          (cartItem) =>
            cartItem.id === item.id &&
            cartItem.size === item.size &&
            cartItem.color === item.color
        );

        if (existingItemIndex !== -1) {
          // Update quantity if item exists
          const updatedCart = [...prev];
          updatedCart[existingItemIndex].quantity += item.quantity;
          return updatedCart;
        } else {
          // Add new item if it doesn't exist
          return [...prev, item];
        }
      });

      // Set cart is open to show the user what was added
      setIsCartOpen(true);

      return { success: true };
    } catch (error) {
      console.error("Error adding to cart:", error);
      return { success: false, message: "Failed to add to cart" };
    }
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  // Update item quantity
  const updateQuantity = (itemId: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    if (!user) {
      localStorage.removeItem("cart");
    }
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    isCartOpen,
    setIsCartOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
