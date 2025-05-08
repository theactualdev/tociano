'use client';

import { useState, useEffect } from 'react';
import { 
  getAllUsers,
  setUserAsAdmin,
  deleteUser
} from '@/lib/firebase';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ShieldOff, Search, Trash2, AlertTriangle } from 'lucide-react';
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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [targetUser, setTargetUser] = useState<any>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'grant' | 'revoke' | 'delete'>('grant');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  
  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers();
        console.log('User data structure:', usersData[0]);
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Failed to load users',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [toast]);
  
  // Filter users when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user => 
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.displayName && user.displayName.toLowerCase().includes(query))
    );
    
    setFilteredUsers(filtered);
  }, [searchQuery, users]);
  
  // Handle admin privilege changes
  const handleAdminAction = (user: any, action: 'grant' | 'revoke') => {
    setTargetUser(user);
    setDialogAction(action);
    setConfirmDialogOpen(true);
  };

  // Handle user deletion
  const handleDeleteUser = (user: any) => {
    // Make sure we have a valid user with ID
    if (!user || (!user.uid && !user.id)) {
      toast({
        title: 'Error',
        description: 'Invalid user data',
        variant: 'destructive'
      });
      return;
    }
    
    // Create a clean user object with just the data we need
    const userToDelete = {
      uid: user.uid || user.id, // Use either uid or id
      email: user.email || 'Unknown email',
      displayName: user.displayName || 'Unnamed User'
    };
    
    setTargetUser(userToDelete);
    setDialogAction('delete');
    setConfirmDialogOpen(true);
  };
  
  const confirmAction = async () => {
    if (!targetUser) return;
    
    setIsSubmitting(true);
    
    try {
      if (dialogAction === 'delete') {
        // Delete user
        console.log('Deleting user with ID:', targetUser.uid);
        // Ensure we have a valid UID
        if (!targetUser.uid) {
          throw new Error('Invalid user ID');
        }
        
        const result = await deleteUser(targetUser.uid);
        
        if (result.success) {
          // Remove user from local state
          setUsers(prev => prev.filter(user => user.uid !== targetUser.uid));
          setFilteredUsers(prev => prev.filter(user => user.uid !== targetUser.uid));
          
          toast({
            title: 'User Deleted',
            description: `${targetUser.email} has been removed from the system.`,
          });
        } else {
          throw new Error(result.error || 'Failed to delete user');
        }
      } else {
        // Handle admin privilege change
        await setUserAsAdmin(targetUser.uid, dialogAction === 'grant');
        
        // Update local state
        setUsers(prev => prev.map(user => {
          if (user.uid === targetUser.uid) {
            return { ...user, isAdmin: dialogAction === 'grant' };
          }
          return user;
        }));
        
        // Update filtered users as well
        setFilteredUsers(prev => prev.map(user => {
          if (user.uid === targetUser.uid) {
            return { ...user, isAdmin: dialogAction === 'grant' };
          }
          return user;
        }));
        
        toast({
          title: 'Success',
          description: `Admin privileges ${dialogAction === 'grant' ? 'granted to' : 'revoked from'} ${targetUser.email}`,
        });
      }
      
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error(`Error performing ${dialogAction} action:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${dialogAction === 'delete' ? 'delete user' : dialogAction + ' admin privileges'}`,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-2rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Users Management</h1>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User Accounts</CardTitle>
          <CardDescription>
            Manage user accounts and admin privileges
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">
              {searchQuery ? 'No users matching your search' : 'No users found'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell>{user.displayName || 'N/A'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.isAdmin ? (
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 text-primary mr-1" />
                            <span>Admin</span>
                          </div>
                        ) : (
                          <span>User</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {user.isAdmin ? (
                                <DropdownMenuItem onClick={() => handleAdminAction(user, 'revoke')}>
                                  <ShieldOff className="h-4 w-4 mr-2" />
                                  Revoke Admin
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleAdminAction(user, 'grant')}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Make Admin
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteUser(user)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'grant' 
                ? 'Grant Admin Privileges' 
                : dialogAction === 'revoke'
                ? 'Revoke Admin Privileges'
                : 'Delete User'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'grant'
                ? 'This will give the user full admin access to the system. They will be able to manage users, products, and orders.'
                : dialogAction === 'revoke'
                ? 'This will remove admin access from the user. They will no longer have access to the admin dashboard.'
                : 'This will permanently delete the user account and all associated data. This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          
          {targetUser && (
            <div className="py-4">
              {dialogAction === 'delete' && (
                <div className="flex items-center mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>Warning: This action is irreversible.</span>
                </div>
              )}
              <p className="font-medium">{targetUser.displayName || 'Unnamed User'}</p>
              <p className="text-sm text-muted-foreground">{targetUser.email}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant={dialogAction === 'grant' ? 'default' : 'destructive'}
              onClick={confirmAction}
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? 'Processing...' 
                : dialogAction === 'grant' 
                  ? 'Grant Admin Access' 
                  : dialogAction === 'revoke'
                  ? 'Revoke Admin Access'
                  : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 