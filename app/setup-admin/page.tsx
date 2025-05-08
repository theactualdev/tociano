'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { makeUserAdmin } from '@/lib/seed-admin';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { redirect } from 'next/navigation';

export default function SetupAdminPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const { user, loading } = useAuth();
  
  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  // For security, only allow logged-in users to access this page
  if (!loading && !user) {
    redirect('/login');
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      const response = await makeUserAdmin(email);
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        message: 'An unexpected error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-16 px-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Setup Admin User</CardTitle>
          <CardDescription>
            Use this tool to create the first admin user. This page should be removed or protected in production.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Enter the email address of the user you want to make an admin
              </p>
            </div>
            
            {result && (
              <div className={`p-4 rounded-md ${
                result.success ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              }`}>
                <div className="flex items-start">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  )}
                  <p>{result.message}</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || !email}
            >
              {isSubmitting ? "Processing..." : "Make Admin"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <div className="mt-8 p-4 border rounded-md bg-secondary/20">
        <h3 className="font-medium mb-2">Important Security Note</h3>
        <p className="text-sm text-muted-foreground">
          This page should be removed or properly secured in a production environment. 
          It is intended for initial setup only.
        </p>
      </div>
    </div>
  );
} 