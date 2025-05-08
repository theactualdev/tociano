'use client';

import { useState, useEffect } from 'react';
import { 
  getSiteSettings, 
  updateSiteSettings
} from '@/lib/firebase';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Store, 
  Truck, 
  CreditCard, 
  AlertTriangle, 
  Save, 
  RefreshCcw,
  Facebook,
  Instagram,
  Twitter,
  Globe,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SiteSettings } from '@/lib/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    storeName: '',
    storeDescription: '',
    contactEmail: '',
    supportPhone: '',
    address: '',
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: ''
    },
    shippingRates: {
      standard: 0,
      express: 0
    },
    paymentOptions: {
      paystack: true,
      payOnDelivery: false
    },
    maintenance: {
      enabled: false,
      message: ''
    },
    termsUrl: '',
    privacyUrl: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Load site settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const siteSettings = await getSiteSettings();
        
        // Create a properly structured settings object with defaults
        const formattedSettings = {
          storeName: siteSettings?.storeName || '',
          storeDescription: siteSettings?.storeDescription || '',
          contactEmail: siteSettings?.contactEmail || '',
          supportPhone: siteSettings?.supportPhone || '',
          address: siteSettings?.address || '',
          socialLinks: {
            facebook: siteSettings?.socialLinks?.facebook || '',
            instagram: siteSettings?.socialLinks?.instagram || '',
            twitter: siteSettings?.socialLinks?.twitter || ''
          },
          shippingRates: {
            standard: siteSettings?.shippingRates?.standard || 0,
            express: siteSettings?.shippingRates?.express || 0
          },
          paymentOptions: {
            paystack: siteSettings?.paymentOptions?.paystack ?? true,
            payOnDelivery: siteSettings?.paymentOptions?.payOnDelivery ?? false
          },
          maintenance: {
            enabled: siteSettings?.maintenance?.enabled || false,
            message: siteSettings?.maintenance?.message || 'We are currently undergoing scheduled maintenance. Please check back soon.'
          },
          termsUrl: siteSettings?.termsUrl || '',
          privacyUrl: siteSettings?.privacyUrl || ''
        };
        
        setSettings(formattedSettings);
      } catch (error) {
        console.error('Error loading site settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load site settings',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [toast]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties using dot notation (e.g., "socialLinks.facebook")
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      // Handle top-level property
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle number input changes (for shipping rates)
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: Number(value)
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: Number(value)
      }));
    }
  };
  
  // Handle toggle changes
  const handleToggleChange = (name: string, checked: boolean) => {
    // Handle nested properties using dot notation
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: checked
        }
      }));
    } else {
      // Handle top-level property
      setSettings(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  };
  
  // Save settings
  const handleSave = async () => {
    setSaving(true);
    
    try {
      await updateSiteSettings(settings);
      
      toast({
        title: 'Settings Updated',
        description: 'Site settings have been updated successfully',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update site settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Enable maintenance mode with confirmation
  const enableMaintenanceMode = async () => {
    setSettings(prev => ({
      ...prev,
      maintenance: {
        ...prev.maintenance,
        enabled: true
      }
    }));
    
    setIsMaintenanceDialogOpen(false);
    
    // Automatically save when enabling maintenance mode
    setSaving(true);
    try {
      await updateSiteSettings({
        ...settings,
        maintenance: {
          ...settings.maintenance,
          enabled: true
        }
      });
      
      toast({
        title: 'Maintenance Mode Enabled',
        description: 'Your store is now in maintenance mode and unavailable to customers',
      });
    } catch (error) {
      console.error('Error enabling maintenance mode:', error);
      toast({
        title: 'Error',
        description: 'Failed to enable maintenance mode',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store Settings</h1>
          <p className="text-muted-foreground">
            Manage your store&apos;s configuration and settings
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <AlertDialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="gap-2 bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-600"
                disabled={settings.maintenance.enabled}
              >
                <AlertTriangle className="h-4 w-4" />
                {settings.maintenance.enabled ? 'Maintenance Mode Active' : 'Enable Maintenance Mode'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Enable Maintenance Mode?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will make your store temporarily unavailable to customers. Only administrators will be able to access the site.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={enableMaintenanceMode}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  Enable Maintenance Mode
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button className="gap-2" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
      
      {settings.maintenance.enabled && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 rounded-md p-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Maintenance Mode is currently active!</p>
            <p className="text-sm mt-1">Your store is not accessible to customers. Turn off maintenance mode in the System tab to restore access.</p>
          </div>
        </div>
      )}
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general" className="gap-2">
            <Store className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="shipping" className="gap-2">
            <Truck className="h-4 w-4" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Settings className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
                <CardDescription>Basic information about your store</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input 
                    id="storeName" 
                    name="storeName" 
                    value={settings.storeName} 
                    onChange={handleChange}
                    placeholder="Your Store Name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storeDescription">Store Description</Label>
                  <Textarea 
                    id="storeDescription" 
                    name="storeDescription" 
                    value={settings.storeDescription} 
                    onChange={handleChange}
                    placeholder="Brief description of your store"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>How customers can reach you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="contactEmail">Contact Email</Label>
                  </div>
                  <Input 
                    id="contactEmail" 
                    name="contactEmail" 
                    value={settings.contactEmail} 
                    onChange={handleChange}
                    placeholder="contact@yourstore.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="supportPhone">Support Phone</Label>
                  </div>
                  <Input 
                    id="supportPhone" 
                    name="supportPhone" 
                    value={settings.supportPhone} 
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="address">Store Address</Label>
                  </div>
                  <Textarea 
                    id="address" 
                    name="address" 
                    value={settings.address} 
                    onChange={handleChange}
                    placeholder="Your store&apos;s physical address"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
                <CardDescription>Your store&apos;s social media profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="socialLinks.facebook">Facebook URL</Label>
                  </div>
                  <Input 
                    id="socialLinks.facebook" 
                    name="socialLinks.facebook" 
                    value={settings.socialLinks.facebook} 
                    onChange={handleChange}
                    placeholder="https://facebook.com/yourstore"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="socialLinks.instagram">Instagram URL</Label>
                  </div>
                  <Input 
                    id="socialLinks.instagram" 
                    name="socialLinks.instagram" 
                    value={settings.socialLinks.instagram} 
                    onChange={handleChange}
                    placeholder="https://instagram.com/yourstore"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="socialLinks.twitter">Twitter URL</Label>
                  </div>
                  <Input 
                    id="socialLinks.twitter" 
                    name="socialLinks.twitter" 
                    value={settings.socialLinks.twitter} 
                    onChange={handleChange}
                    placeholder="https://twitter.com/yourstore"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Legal Pages</CardTitle>
                <CardDescription>URLs for your legal pages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="termsUrl">Terms & Conditions URL</Label>
                  <Input 
                    id="termsUrl" 
                    name="termsUrl" 
                    value={settings.termsUrl} 
                    onChange={handleChange}
                    placeholder="/terms"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="privacyUrl">Privacy Policy URL</Label>
                  <Input 
                    id="privacyUrl" 
                    name="privacyUrl" 
                    value={settings.privacyUrl} 
                    onChange={handleChange}
                    placeholder="/privacy"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Shipping Settings */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Rates</CardTitle>
              <CardDescription>Configure shipping options and costs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Standard Delivery</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="shippingRates.standard">Price (₦)</Label>
                    <Input 
                      id="shippingRates.standard" 
                      name="shippingRates.standard" 
                      type="number"
                      value={settings.shippingRates.standard} 
                      onChange={handleNumberChange}
                      min={0}
                      step={100}
                    />
                    <p className="text-sm text-muted-foreground">
                      Standard delivery (3-5 business days)
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Express Delivery</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="shippingRates.express">Price (₦)</Label>
                    <Input 
                      id="shippingRates.express" 
                      name="shippingRates.express" 
                      type="number"
                      value={settings.shippingRates.express} 
                      onChange={handleNumberChange}
                      min={0}
                      step={100}
                    />
                    <p className="text-sm text-muted-foreground">
                      Express delivery (1-2 business days)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Shipping Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Configure payment options for your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Paystack</Label>
                    <p className="text-sm text-muted-foreground">
                      Accept credit/debit cards and bank transfers via Paystack
                    </p>
                  </div>
                  <Switch
                    checked={settings.paymentOptions.paystack}
                    onCheckedChange={(checked) => handleToggleChange('paymentOptions.paystack', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Pay on Delivery</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to pay with cash upon delivery
                    </p>
                  </div>
                  <Switch
                    checked={settings.paymentOptions.payOnDelivery}
                    onCheckedChange={(checked) => handleToggleChange('paymentOptions.payOnDelivery', checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Payment Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* System Settings */}
        <TabsContent value="system">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Mode</CardTitle>
                <CardDescription>Temporarily disable your store</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your store temporarily unavailable to customers
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenance.enabled}
                    onCheckedChange={(checked) => handleToggleChange('maintenance.enabled', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maintenance.message">Maintenance Message</Label>
                  <Textarea 
                    id="maintenance.message" 
                    name="maintenance.message" 
                    value={settings.maintenance.message} 
                    onChange={handleChange}
                    placeholder="We are currently undergoing scheduled maintenance. Please check back soon."
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Maintenance Settings'}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Store Cache</CardTitle>
                <CardDescription>Clear your store&apos;s cache</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  If you&apos;re experiencing issues with your store, or if recent changes are not showing up, you may need to clear the cache.
                </p>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" className="gap-2">
                  <RefreshCcw className="h-4 w-4" />
                  Clear Cache
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 