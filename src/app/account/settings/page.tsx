"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { updateUserSettings, getUserSettings } from "@/lib/firebase";
import { Button } from "@/src/components/ui/button";
import {@/src/components/ui/card
  Card,@/src/components/ui/label
  CardContent,@/src/components/ui/switch
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/src/hooks/use-toast";
import { Bell, Mail, Lock, Shield, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const { user, userData } = useAuth();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    orderUpdates: true,
    promotions: false,
    newsletter: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    activityTracking: true,
    dataSharing: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        const settings = await getUserSettings(user.uid);
        if (settings.notifications) {
          setNotifications(settings.notifications);
        }
        if (settings.privacy) {
          setPrivacy(settings.privacy);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, [user]);

  const handleNotificationChange = async (key: keyof typeof notifications) => {
    try {
      const newNotifications = {
        ...notifications,
        [key]: !notifications[key],
      };

      setNotifications(newNotifications);

      if (user) {
        await updateUserSettings(user.uid, {
          notifications: newNotifications,
        });
      }

      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved",
      });
    } catch (error) {
      console.error("Error updating notifications:", error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const handlePrivacyChange = async (key: keyof typeof privacy) => {
    try {
      const newPrivacy = {
        ...privacy,
        [key]: !privacy[key],
      };

      setPrivacy(newPrivacy);

      if (user) {
        await updateUserSettings(user.uid, {
          privacy: newPrivacy,
        });
      }

      toast({
        title: "Settings Updated",
        description: "Your privacy settings have been saved",
      });
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Manage how you receive notifications and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive order updates via email
              </p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={() => handleNotificationChange("email")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notifications on your device
              </p>
            </div>
            <Switch
              checked={notifications.push}
              onCheckedChange={() => handleNotificationChange("push")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Order Updates</Label>
              <p className="text-sm text-muted-foreground">
                Updates about your orders and deliveries
              </p>
            </div>
            <Switch
              checked={notifications.orderUpdates}
              onCheckedChange={() => handleNotificationChange("orderUpdates")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Promotional Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about sales and special offers
              </p>
            </div>
            <Switch
              checked={notifications.promotions}
              onCheckedChange={() => handleNotificationChange("promotions")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Newsletter</Label>
              <p className="text-sm text-muted-foreground">
                Weekly newsletter with fashion tips and trends
              </p>
            </div>
            <Switch
              checked={notifications.newsletter}
              onCheckedChange={() => handleNotificationChange("newsletter")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Privacy</CardTitle>
          </div>
          <CardDescription>
            Manage your privacy and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Make your profile visible to other users
              </p>
            </div>
            <Switch
              checked={privacy.profileVisibility}
              onCheckedChange={() => handlePrivacyChange("profileVisibility")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Activity Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Allow us to track your activity for better recommendations
              </p>
            </div>
            <Switch
              checked={privacy.activityTracking}
              onCheckedChange={() => handlePrivacyChange("activityTracking")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Data Sharing</Label>
              <p className="text-sm text-muted-foreground">
                Share your data with our trusted partners
              </p>
            </div>
            <Switch
              checked={privacy.dataSharing}
              onCheckedChange={() => handlePrivacyChange("dataSharing")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Change Password</h3>
              <p className="text-sm text-muted-foreground">
                Update your account password
              </p>
            </div>
            <Button variant="outline">Update</Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline">Enable</Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Login History</h3>
              <p className="text-sm text-muted-foreground">
                View your recent login activity
              </p>
            </div>
            <Button variant="outline">View</Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>Email Settings</CardTitle>
          </div>
          <CardDescription>Manage your email preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Primary Email</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.email}
              </p>
            </div>
            <Button variant="outline">Change Email</Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      {/* <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle>Payment Settings</CardTitle>
          </div>
          <CardDescription>
            Manage your payment methods and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Saved Payment Methods</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No payment methods saved
              </p>
            </div>
            <Button variant="outline">Add Payment Method</Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
