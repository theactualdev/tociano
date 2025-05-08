'use client';

import { useState, useEffect } from 'react';
import { 
  getAllOrders,
  updateOrderStatus,
  migrateAllOrdersCustomerInfo
} from '@/lib/firebase';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  PackageCheck, 
  Truck, 
  X,
  ShoppingBag,
  MoreHorizontal,
  Calendar,
  User 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Order } from '@/lib/types';

// Order status options
const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

// Date filter options
const DATE_FILTERS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' }
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  
  const { toast } = useToast();
  
  // Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersData = await getAllOrders();
        // Sort by date, newest first
        const sortedOrders = ordersData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
        
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: 'Error',
          description: 'Failed to load orders',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [toast]);
  
  // Apply filters when search, status or date filter changes
  useEffect(() => {
    let result = [...orders];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(query) || 
        order.customer?.name?.toLowerCase().includes(query) ||
        order.customer?.email?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (selectedStatus !== 'all') {
      result = result.filter(order => order.status === selectedStatus);
    }
    
    // Apply date filter
    if (selectedDateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      result = result.filter(order => {
        const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt || 0);
        
        switch (selectedDateFilter) {
          case 'today':
            return orderDate >= today;
          case 'yesterday': {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return orderDate >= yesterday && orderDate < today;
          }
          case 'week': {
            const weekStart = new Date(today);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            return orderDate >= weekStart;
          }
          case 'month': {
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            return orderDate >= monthStart;
          }
          default:
            return true;
        }
      });
    }
    
    setFilteredOrders(result);
  }, [searchQuery, selectedStatus, selectedDateFilter, orders]);
  
  // Get status badge based on order status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Pending</Badge>;
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
  
  // Handle status update
  const handleUpdateStatus = async () => {
    if (!currentOrder || !newStatus) return;
    
    setIsUpdating(true);
    
    try {
      await updateOrderStatus(currentOrder.id, newStatus);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === currentOrder.id 
            ? { ...order, status: newStatus } 
            : order
        )
      );
      
      toast({
        title: 'Status Updated',
        description: `Order #${currentOrder.id} status changed to ${newStatus}`,
      });
      
      setIsStatusDialogOpen(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // View order details
  const handleViewDetails = (order: Order) => {
    setCurrentOrder(order);
    setIsDetailsDialogOpen(true);
  };
  
  // Open status update dialog
  const handleChangeStatus = (order: Order) => {
    setCurrentOrder(order);
    setNewStatus(order.status || 'pending');
    setIsStatusDialogOpen(true);
  };
  
  // Get count by status
  const getStatusCount = (status: string) => {
    if (status === 'all') return orders.length;
    return orders.filter(order => order.status === status).length;
  };
  
  // Handle migration of all orders to include customer info
  const handleMigrateOrders = async () => {
    setIsMigrating(true);
    
    try {
      const result = await migrateAllOrdersCustomerInfo();
      
      if (result.success) {
        toast({
          title: 'Orders Migrated',
          description: result.message,
        });
        
        // Refresh orders
        const ordersData = await getAllOrders();
        const sortedOrders = ordersData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
        
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
      } else {
        toast({
          title: 'Migration Error',
          description: 'Failed to migrate orders',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error in order migration:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred during migration',
        variant: 'destructive'
      });
    } finally {
      setIsMigrating(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Order Management</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={selectedStatus}
            onValueChange={setSelectedStatus}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedDateFilter}
            onValueChange={setSelectedDateFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              {DATE_FILTERS.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleMigrateOrders}
          disabled={isMigrating}
        >
          {isMigrating ? 'Fixing Orders...' : 'Fix Missing Customer Info'}
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Manage and update customer orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All Orders ({getStatusCount('all')})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({getStatusCount('pending')})
              </TabsTrigger>
              <TabsTrigger value="processing">
                Processing ({getStatusCount('processing')})
              </TabsTrigger>
              <TabsTrigger value="shipped">
                Shipped ({getStatusCount('shipped')})
              </TabsTrigger>
              <TabsTrigger value="delivered">
                Delivered ({getStatusCount('delivered')})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled ({getStatusCount('cancelled')})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {renderOrdersTable(filteredOrders)}
            </TabsContent>
            
            <TabsContent value="pending">
              {renderOrdersTable(orders.filter(o => o.status === 'pending'))}
            </TabsContent>
            
            <TabsContent value="processing">
              {renderOrdersTable(orders.filter(o => o.status === 'processing'))}
            </TabsContent>
            
            <TabsContent value="shipped">
              {renderOrdersTable(orders.filter(o => o.status === 'shipped'))}
            </TabsContent>
            
            <TabsContent value="delivered">
              {renderOrdersTable(orders.filter(o => o.status === 'delivered'))}
            </TabsContent>
            
            <TabsContent value="cancelled">
              {renderOrdersTable(orders.filter(o => o.status === 'cancelled'))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Order Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete information about order #{currentOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          {currentOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Date Placed</h3>
                  <p>{formatDate(currentOrder.createdAt?.toDate?.() || currentOrder.createdAt || new Date())}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Status</h3>
                  <div>{getStatusBadge(currentOrder.status)}</div>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Total Amount</h3>
                  <p className="font-semibold">{formatCurrency(currentOrder.total || 0)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Items</h3>
                  <p>{currentOrder.items?.length || 0} items</p>
                </div>
              </div>
              
              {/* Customer Information */}
              <div>
                <h3 className="font-medium mb-2">Customer Information</h3>
                <div className="bg-muted p-3 rounded-md">
                  <p>Name: {currentOrder.customer?.name || 'N/A'}</p>
                  <p>Email: {currentOrder.customer?.email || 'N/A'}</p>
                  <p>Phone: {currentOrder.customer?.phone || 'N/A'}</p>
                </div>
              </div>
              
              {/* Shipping Address */}
              <div>
                <h3 className="font-medium mb-2">Shipping Address</h3>
                <div className="bg-muted p-3 rounded-md">
                  <p>{currentOrder.shippingAddress?.street || 'N/A'}</p>
                  <p>{currentOrder.shippingAddress?.city}, {currentOrder.shippingAddress?.state} {currentOrder.shippingAddress?.postalCode}</p>
                  <p>{currentOrder.shippingAddress?.country}</p>
                </div>
              </div>
              
              {/* Order Items */}
              <div>
                <h3 className="font-medium mb-2">Order Items</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentOrder.items?.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              {(item.size || item.color) && (
                                <div className="text-sm text-muted-foreground">
                                  {item.size && `Size: ${item.size}`}
                                  {item.size && item.color && ' | '}
                                  {item.color && `Color: ${item.color}`}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatCurrency(currentOrder.subtotal || currentOrder.total || 0)}</span>
                </div>
                {currentOrder.shipping && typeof currentOrder.shipping.cost === 'number' && currentOrder.shipping.cost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span>{formatCurrency(currentOrder.shipping.cost)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(currentOrder.total || 0)}</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDetailsDialogOpen(false)}
                >
                  Close
                </Button>
                <Button onClick={() => {
                  setIsDetailsDialogOpen(false);
                  setTimeout(() => handleChangeStatus(currentOrder), 100);
                }}>
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change status for order #{currentOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select
              value={newStatus}
              onValueChange={setNewStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="mt-4">
              <div className="flex items-center p-2 bg-muted rounded">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">
                  Order Date: {currentOrder && formatDate(currentOrder.createdAt?.toDate?.() || currentOrder.createdAt || new Date())}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsStatusDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateStatus}
              disabled={isUpdating || newStatus === currentOrder?.status}
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
  
  // Helper function to render orders table
  function renderOrdersTable(orders: Order[]) {
    if (orders.length === 0) {
      return (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Orders Found</h3>
          <p className="text-muted-foreground">
            {searchQuery || selectedStatus !== 'all' || selectedDateFilter !== 'all'
              ? 'Try adjusting your filters to see more results'
              : 'No orders have been placed yet'}
          </p>
        </div>
      );
    }
    
    return (
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{typeof order.id === 'string' ? `${order.id.substring(0, 8)}...` : order.id || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{order.customer?.name || 'Anonymous'}</span>
                    <span className="text-xs text-muted-foreground">{order.customer?.email || 'No email'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {formatDate(order.createdAt?.toDate?.() || order.createdAt || new Date())}
                </TableCell>
                <TableCell>{order.items?.length || 0}</TableCell>
                <TableCell className="font-medium">{formatCurrency(order.total || 0)}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChangeStatus(order)}>
                        Update Status
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
} 