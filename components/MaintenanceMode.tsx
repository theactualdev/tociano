'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getSiteSettings } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { AlertTriangle, Settings, ArrowLeft } from 'lucide-react';
import { SiteSettings } from '@/lib/types';

interface MaintenanceState {
  enabled: boolean;
  message: string;
}

export function MaintenanceMode({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState<MaintenanceState>({
    enabled: false,
    message: ''
  });
  const { isAdmin } = useAuth();
  const pathname = usePathname();
  
  // Admin paths should always be accessible to admins
  const isAdminPath = pathname.startsWith('/admin');
  
  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        const siteSettings = await getSiteSettings();
        // Safely access maintenance settings with fallbacks
        const maintenanceSettings = siteSettings?.maintenance || {};
        setMaintenance({
          enabled: maintenanceSettings.enabled || false,
          message: maintenanceSettings.message || 'We are currently undergoing scheduled maintenance. Please check back soon.'
        });
      } catch (error) {
        console.error('Error checking maintenance mode:', error);
        // On error, default to no maintenance mode
        setMaintenance({
          enabled: false,
          message: ''
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkMaintenanceMode();
  }, []);
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  // If maintenance mode is not enabled, show the regular content
  if (!maintenance.enabled) {
    return children;
  }
  
  // If user is admin and accessing admin paths, allow access
  if (isAdmin && isAdminPath) {
    return children;
  }
  
  // Show maintenance page
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-amber-100 p-3">
            <AlertTriangle className="h-12 w-12 text-amber-600" />
          </div>
        </div>
        
        <h1 className="mb-3 text-3xl font-bold">Maintenance Mode</h1>
        
        <p className="mb-8 text-lg text-muted-foreground">
          {maintenance.message}
        </p>
        
        {isAdmin && (
          <div className="space-y-4">
            <Button asChild variant="default" className="w-full">
              <Link href="/admin/settings" className="inline-flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Go to Settings
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin" className="inline-flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Admin Dashboard
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 