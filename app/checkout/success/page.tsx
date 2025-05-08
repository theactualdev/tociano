'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Suspense } from 'react';

// Inner component that uses useSearchParams
function CheckoutDetails() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Redirect if no order ID is provided
    if (!orderId) {
      router.push('/');
      return;
    }
    
    const fetchOrder = async () => {
      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() });
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId, router]);
  
  // If loading
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">Processing your order...</h1>
          <div className="animate-pulse h-48 bg-secondary rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  // If error
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto bg-card rounded-lg border p-8">
        <div className="text-center mb-8">
          <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Thank You for Your Order!</h1>
          <p className="text-muted-foreground">
            Your order has been received and is being processed.
          </p>
        </div>
        
        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Order Number</h3>
            <p>{order.id}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Date</h3>
            <p>{formatDate(order.createdAt?.toDate() || new Date())}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Email</h3>
            <p>{order.billing.email}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Payment Method</h3>
            <p>Paystack</p>
          </div>
        </div>
        
        {/* Order Status */}
        <div className="bg-muted p-4 rounded-lg mb-8">
          <div className="flex items-center">
            <div className="mr-4">
              <Clock className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Order Status: Processing</h3>
              <p className="text-sm text-muted-foreground">
                We&apos;re preparing your order for shipment. You&apos;ll receive an email when your order ships.
              </p>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        <div className="border rounded-lg overflow-hidden mb-8">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item: any) => (
                <tr key={`${item.id}-${item.size}-${item.color}`} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                      {item.size && `, Size: ${item.size}`}
                      {item.color && `, Color: ${item.color}`}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted">
              <tr className="border-t">
                <td className="px-4 py-3 font-medium">Subtotal</td>
                <td className="px-4 py-3 text-right">{formatCurrency(order.subtotal)}</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-3 font-medium">Shipping</td>
                <td className="px-4 py-3 text-right">{formatCurrency(order.shipping.cost)}</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-3 font-semibold">Total</td>
                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(order.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {/* Shipping Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4">Shipping Address</h3>
            <address className="not-italic text-muted-foreground">
              {order.billing.firstName} {order.billing.lastName}<br />
              {order.billing.address}<br />
              {order.billing.city}, {order.billing.state} {order.billing.postalCode}<br />
              Nigeria<br />
              {order.billing.phone}
            </address>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Shipping Method</h3>
            <div className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>
                {order.shipping.method === 'standard' ? 'Standard Delivery (3-5 business days)' : 
                  'Express Delivery (1-2 business days)'}
              </span>
            </div>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/account/orders">View My Orders</Link>
          </Button>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <div className="animate-pulse h-48 bg-secondary rounded-lg"></div>
        </div>
      </div>
    }>
      <CheckoutDetails />
    </Suspense>
  );
}