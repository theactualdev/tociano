"use client";

import { ShoppingBag, X, Trash2, Plus, Minus } from "lucide-react";
import { useCart, CartItem } from "@/src/context/CartContext";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface CartSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function CartSidebar({ isOpen, setIsOpen }: CartSidebarProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-background shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Your Cart</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <CartItems />

          {/* Footer */}
          <CartFooter setIsOpen={setIsOpen} />
        </div>
      </div>
    </>
  );
}

function CartItems() {
  const { cart, removeFromCart, updateQuantity } = useCart();

  if (cart.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
        <p className="text-muted-foreground mb-6 text-center">
          Looks like you haven't added any items to your cart yet.
        </p>
        <Button asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-4">
      <ul className="space-y-4 px-4">
        {cart.map((item) => (
          <CartItemCard
            key={`${item.id}-${item.size}-${item.color}`}
            item={item}
            onRemove={() => removeFromCart(item.id)}
            onUpdateQuantity={(quantity) => updateQuantity(item.id, quantity)}
          />
        ))}
      </ul>
    </div>
  );
}

function CartItemCard({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}) {
  return (
    <li className="flex space-x-4 border-b border-border pb-4">
      {/* Image */}
      <div className="h-24 w-20 relative bg-secondary rounded overflow-hidden">
        <Image src={item.image} alt={item.name} fill className="object-cover" />
      </div>

      {/* Details */}
      <div className="flex-1">
        <div className="flex justify-between">
          <h4 className="font-medium">{item.name}</h4>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRemove}
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-sm text-muted-foreground mb-2">
          {item.size && <span className="mr-2">Size: {item.size}</span>}
          {item.color && <span>Color: {item.color}</span>}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center border rounded">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="font-medium">
            {formatCurrency(item.price * item.quantity)}
          </div>
        </div>
      </div>
    </li>
  );
}

function CartFooter({ setIsOpen }: { setIsOpen: (isOpen: boolean) => void }) {
  const { cart, subtotal } = useCart();

  // Fixed shipping cost for Nigeria (could be made dynamic based on location/weight)
  const shipping = cart.length > 0 ? 2000 : 0; // 2000 Naira
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="p-4 border-t bg-secondary/30">
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{formatCurrency(shipping)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-medium text-lg pt-2">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
      <div className="space-y-2">
        <Button className="w-full" asChild>
          <Link href="/checkout" onClick={() => setIsOpen(false)}>
            Checkout
          </Link>
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsOpen(false)}
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
