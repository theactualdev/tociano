"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePaystackPayment } from "react-paystack";
import Link from "next/link";
import Image from "next/image";
import { Check, CreditCard } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Separator } from "@/src/components/ui/separator";
import { useToast } from "@/src/hooks/use-toast";
import { useAuth } from "@/src/context/AuthContext";
import { useCart } from "@/src/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { doc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CheckoutPage() {
  const { user, userData } = useAuth();
  const { cart, subtotal, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  // Shipping options
  const shippingOptions = [
    {
      id: "standard",
      name: "Standard Delivery",
      price: 2000,
      description: "3-5 business days",
    },
    {
      id: "express",
      name: "Express Delivery",
      price: 4500,
      description: "1-2 business days",
    },
  ];

  // State for form values
  const [formData, setFormData] = useState({
    firstName: userData?.displayName?.split(" ")[0] || "",
    lastName: userData?.displayName?.split(" ").slice(1).join(" ") || "",
    email: userData?.email || "",
    phone: userData?.phoneNumber || "",
    address: userData?.address?.street || "N/A",
    city: userData?.address?.city || "N/A",
    state: userData?.address?.state || "N/A",
    postalCode: userData?.address?.postalCode || "N/A",
  });

  // Shipping selection state
  const [selectedShipping, setSelectedShipping] = useState(
    shippingOptions[0].id
  );

  // Calculate totals
  const shippingCost =
    shippingOptions.find((option) => option.id === selectedShipping)?.price ||
    0;
  const total = subtotal + shippingCost;

  // Handle form change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Paystack configuration
  const paystackConfig = {
    reference: `order_${new Date().getTime()}`,
    email: formData.email,
    amount: total * 100, // Paystack amount is in kobo (100 kobo = 1 Naira)
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
  };

  // Initialize Paystack payment hook
  const initializePayment = usePaystackPayment(paystackConfig);

  // Paystack callback functions
  const onSuccess = async (reference: any) => {
    try {
      // Create order in Firestore
      const order = {
        userId: user?.uid || "guest",
        items: cart,
        shipping: {
          method: selectedShipping,
          cost: shippingCost,
        },
        billing: {
          firstName: formData.firstName || "N/A",
          lastName: formData.lastName || "N/A",
          email: formData.email || "N/A",
          phone: formData.phone || "N/A",
          address: formData.address || "N/A",
          city: formData.city || "N/A",
          state: formData.state || "N/A",
          postalCode: formData.postalCode || "N/A",
        },
        subtotal,
        total,
        paymentStatus: "paid",
        paymentReference: reference?.reference || "N/A",
        status: "processing",
        createdAt: serverTimestamp(),
      };

      // Add to orders collection
      const orderRef = await addDoc(collection(db, "orders"), order);

      // Show success toast
      toast({
        title: "Order Placed!",
        description: "Your order has been successfully placed.",
        variant: "default",
      });

      // Clear cart
      clearCart();

      // Redirect to success page
      router.push(`/checkout/success?orderId=${orderRef.id}`);
    } catch (error) {
      console.error("Error saving order:", error);
      toast({
        title: "Error",
        description: "There was a problem processing your order.",
        variant: "destructive",
      });
    }
  };

  const onClose = () => {
    toast({
      title: "Payment Cancelled",
      description: "Your payment was cancelled.",
      variant: "destructive",
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "state",
    ];

    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData]
    );

    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Validate phone (simple check)
    if (formData.phone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    // If cart is empty, show error
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add some items before checkout.",
        variant: "destructive",
      });
      return;
    }

    // Start Paystack payment
    initializePayment(() => onSuccess({}), onClose);
  };

  // If cart is empty, show empty state
  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            You have no items in your cart. Add some products to proceed with
            checkout.
          </p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Information */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Method</h2>
              <div className="space-y-4">
                {shippingOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-4">
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                        selectedShipping === option.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground"
                      }`}
                      onClick={() => setSelectedShipping(option.id)}
                    >
                      {selectedShipping === option.id && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{option.name}</span>
                        <span className="font-semibold">
                          {formatCurrency(option.price)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method (Only Paystack for now) */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="flex items-center space-x-4">
                <div className="w-6 h-6 rounded-full border border-primary bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">Pay with Paystack</span>
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Secure payment via credit card, debit card, or bank transfer
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Order Summary (visible on small screens) */}
            <div className="lg:hidden bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatCurrency(shippingCost)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-lg">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Place Order
            </Button>
          </form>
        </div>

        {/* Order Summary (right sidebar on large screens) */}
        <div className="hidden lg:block">
          <div className="bg-card rounded-lg border p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            {/* Cart Items */}
            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="flex space-x-3"
                >
                  <div className="h-16 w-16 relative bg-secondary rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium line-clamp-1">
                      {item.name}
                    </h4>
                    <div className="text-xs text-muted-foreground mb-1">
                      {item.size && (
                        <span className="mr-2">Size: {item.size}</span>
                      )}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs">
                        {item.quantity} × {formatCurrency(item.price)}
                      </span>
                      <span className="text-sm font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Totals */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{formatCurrency(shippingCost)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold text-lg pt-2">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <Button className="w-full" size="lg" form="checkout-form">
              Place Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
