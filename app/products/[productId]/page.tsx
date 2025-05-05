"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Minus, Plus, ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { useCart, CartItem } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";

// Define a type for the product data
interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  features: string[];
  colors: string[];
  sizes: string[];
  category: string;
  inStock: boolean;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const [product, setProduct] = useState<Product>({
    id: "",
    name: "",
    price: 0,
    images: [],
    description: "",
    features: [],
    colors: [],
    sizes: [],
    category: "",
    inStock: false,
  });

  useEffect(() => {
    const fetchProductData = async (productId: string) => {
      try {
        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const { id, ...data } = productSnap.data() as Product;
          const fetchedProduct = { id: productSnap.id, ...data };
          setProduct({
            id: fetchedProduct.id,
            name: fetchedProduct.name || "",
            price: fetchedProduct.price || 0,
            images: fetchedProduct.images || [],
            description: fetchedProduct.description || "",
            features: fetchedProduct.features || [],
            colors: fetchedProduct.colors || [],
            sizes: fetchedProduct.sizes || [],
            category: fetchedProduct.category || "",
            inStock: fetchedProduct.inStock || false,
          });
        } else {
          throw new Error("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };
    fetchProductData(resolvedParams.id);
    resolvedParams;
  }, [params]);

  const [mainImage, setMainImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (product.images.length > 0) {
      setMainImage(product.images[0]);
    }
  }, [product.images]);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[1]);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0],
      color: selectedColor,
      size: selectedSize,
    };

    addToCart(cartItem);

    toast({
      title: "Added to cart",
      description: `${product.name} (${selectedSize}, ${selectedColor}) has been added to your cart.`,
    });
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/products" className="hover:text-primary">
          Products
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link
          href={`/category/${product.category}`}
          className="hover:text-primary capitalize"
        >
          {product.category}
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground truncate max-w-[100px] sm:max-w-xs">
          {product.name}
        </span>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={mainImage || "/placeholder-image.jpg"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {product.images.map((image, i) => (
              <button
                key={i}
                className={`relative aspect-square rounded-md overflow-hidden ${
                  mainImage === image
                    ? "ring-2 ring-primary"
                    : "ring-1 ring-border"
                }`}
                onClick={() => setMainImage(image)}
                aria-label={`View image ${i + 1} of product`}
              >
                <Image
                  src={image}
                  alt={`${product.name} ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl font-semibold text-primary mb-4">
            {formatCurrency(product.price)}
          </p>

          <div className="space-y-6">
            {/* Product Description */}
            <p className="text-muted-foreground">{product.description}</p>

            {/* Color Selection */}
            <div>
              <h3 className="font-medium mb-3">Color</h3>
              <RadioGroup
                value={selectedColor}
                onValueChange={setSelectedColor}
                className="flex space-x-3"
              >
                {product.colors.map((color) => (
                  <div key={color} className="flex items-center space-x-2">
                    <RadioGroupItem value={color} id={`color-${color}`} />
                    <Label className="capitalize" htmlFor={`color-${color}`}>
                      {color}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Size</h3>
                <Link
                  href="/size-guide"
                  className="text-sm text-primary hover:underline"
                >
                  Size Guide
                </Link>
              </div>
              <RadioGroup
                value={selectedSize}
                onValueChange={setSelectedSize}
                className="flex space-x-3"
              >
                {product.sizes.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <RadioGroupItem value={size} id={`size-${size}`} />
                    <Label className="capitalize" htmlFor={`size-${size}`}>
                      {size}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-medium mb-3">Quantity</h3>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={increaseQuantity}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button className="flex-1" size="lg" onClick={handleAddToCart}>
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg" className="flex-1">
                <Heart className="mr-2 h-5 w-5" />
                Add to Wishlist
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="p-6 border rounded-b-lg">
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-4">Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-4">
                Care Instructions
              </h3>
              <p>
                Hand wash in cold water with mild detergent. Do not bleach. Hang
                to dry in shade. Iron on low heat if necessary. Store in a cool,
                dry place.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="shipping" className="p-6 border rounded-b-lg">
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-4">
                Shipping Information
              </h3>
              <p className="mb-4">
                We offer nationwide delivery within Nigeria, with the following
                estimated delivery times:
              </p>
              <ul className="space-y-2 mb-6">
                <li>Lagos: 1-2 business days</li>
                <li>Other major cities: 2-4 business days</li>
                <li>Remote areas: 3-7 business days</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-4">
                Returns Policy
              </h3>
              <p>
                If you're not completely satisfied with your purchase, you can
                return it within 14 days of delivery. Items must be unworn,
                unwashed, and with all original tags attached. Please note that
                the customer is responsible for the return shipping costs.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="p-6 border rounded-b-lg">
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
              <p>
                This product has no reviews yet. Be the first to leave a review!
              </p>
              <Button className="mt-4">Write a Review</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
