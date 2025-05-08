'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Eye } from 'lucide-react';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.uid) return;
      
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user?.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user]);
  
  // Get status badge variants
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning">Processing</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-success/10 text-success border-success">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Filter orders by status for tabs
  const processingOrders = orders.filter(order => order.status === 'processing' || order.status === 'shipped');
  const completedOrders = orders.filter(order => order.status === 'delivered');
  const cancelledOrders = orders.filter(order => order.status === 'cancelled');
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-8 bg-muted rounded w-1/4"></div>
        <div className="animate-pulse h-64 bg-muted rounded"></div>
      </div>
    );
  }
  
  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
          <CardDescription>
            View and track all your orders
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            You haven&apos;t placed any orders yet. Browse our products and place your first order!
          </p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
          <CardDescription>
            View and track all your orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
              <TabsTrigger value="processing">Processing ({processingOrders.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({cancelledOrders.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {renderOrderList(orders)}
            </TabsContent>
            
            <TabsContent value="processing" className="space-y-4">
              {processingOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No processing orders</p>
              ) : (
                renderOrderList(processingOrders)
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {completedOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No completed orders</p>
              ) : (
                renderOrderList(completedOrders)
              )}
            </TabsContent>
            
            <TabsContent value="cancelled" className="space-y-4">
              {cancelledOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No cancelled orders</p>
              ) : (
                renderOrderList(cancelledOrders)
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
  
  function renderOrderList(orderList: any[]) {
    return orderList.map(order => (
      <div key={order.id} className="border rounded-lg overflow-hidden">
        <div className="bg-muted px-4 py-3">
          <div className="flex flex-col sm:flex-row justify-between">
            <div className="mb-2 sm:mb-0">
              <span className="text-sm text-muted-foreground">Order #:</span>
              <span className="font-medium ml-2">{order.id}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Date:</span>
                <span className="ml-2">
                  {formatDate(order.createdAt?.toDate() || new Date())}
                </span>
              </div>
              <div>{getStatusBadge(order.status)}</div>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <h4 className="font-medium mb-1">Items</h4>
            <ul className="space-y-2">
              {order.items.map((item: any) => (
                <li key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between">
                  <span>
                    {item.name} × {item.quantity}
                    {item.size && ` (${item.size}`}
                    {item.color && `, ${item.color})`}
                  </span>
                  <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-between border-t pt-3">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">{formatCurrency(order.total)}</span>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/account/orders/${order.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </Button>
          </div>
        </div>
      </div>
    ));
  }
}