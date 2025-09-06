import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navigation from '@/components/Navigation';
import { ProfileSettings } from '@/components/ProfileSettings';
import { usePlatforms } from '@/hooks/usePlatforms';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  CreditCard, 
  Shield, 
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  Crown,
  Globe
} from 'lucide-react';

const Settings = () => {
  const { platforms, getConnectedPlatforms } = usePlatforms();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    marketing: false,
  });

  const [platformConnections, setPlatformConnections] = useState(platforms);

  const togglePlatform = (platformId: string) => {
    setPlatformConnections(prev =>
      prev.map(p => 
        p.id === platformId 
          ? { ...p, connected: !p.connected }
          : p
      )
    );
    
    // Special handling for Pinterest - show connection modal
    if (platformId === 'pinterest') {
      // In a real app, this would open a connection modal
      console.log('Opening Pinterest connection modal...');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <SettingsIcon className="h-8 w-8" />
              Settings
            </h1>
            <p className="text-muted-foreground">Manage your account preferences and integrations</p>
          </div>

          {/* Settings Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="platforms" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Platforms</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Billing</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2 hidden lg:flex">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <ProfileSettings />
            </TabsContent>

            <TabsContent value="platforms" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Connected Platforms
                  </CardTitle>
                  <CardDescription>
                    Manage your social media platform connections for publishing content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {platformConnections.map((platform) => (
                    <div key={platform.id} className="flex items-center justify-between p-4 border border-neo-purple/20 rounded-lg bg-muted/5">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{platform.icon}</div>
                        <div>
                          <h3 className="font-medium text-foreground">{platform.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {platform.connected ? (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                Connected
                                {platform.accounts.length > 0 && (
                                  <span>• {platform.accounts.length} account{platform.accounts.length > 1 ? 's' : ''}</span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                                Not connected
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {platform.connected && (
                          <Badge variant="outline" className="text-xs">
                            {platform.capabilities.canPublish ? 'Publish' : 'Draft only'}
                          </Badge>
                        )}
                        {platform.connected ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePlatform(platform.id)}
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button
                            variant="hero"
                            size="sm"
                            onClick={() => togglePlatform(platform.id)}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Connect your social media accounts to start publishing content directly from ViralSlides AI.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Billing & Credits
                  </CardTitle>
                  <CardDescription>
                    Manage your subscription and credit usage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-card border border-neo-purple/20 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        Current Plan: Free
                      </h3>
                      <p className="text-sm text-muted-foreground">100 credits per month</p>
                    </div>
                    <Button variant="hero">Upgrade</Button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Payment Method</h4>
                    <div className="flex items-center justify-between p-4 border border-neo-purple/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-hero rounded flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">No payment method</p>
                          <p className="text-sm text-muted-foreground">Add a payment method to upgrade</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Add Card</Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Billing History</h4>
                    <div className="text-center py-8 text-muted-foreground">
                      <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No billing history available</p>
                      <p className="text-sm">Upgrade to a paid plan to see your billing history</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about account activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">Email Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">Push Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">SMS Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive important updates via SMS</p>
                      </div>
                      <Switch
                        checked={notifications.sms}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">Marketing Communications</h4>
                        <p className="text-sm text-muted-foreground">Receive updates about new features and offers</p>
                      </div>
                      <Switch
                        checked={notifications.marketing}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
                      />
                    </div>
                  </div>

                  <Button className="w-full md:w-auto">Save Preferences</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account security and privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Change Password</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input
                            id="current-password"
                            type="password"
                            placeholder="Enter current password"
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-password">New Password</Label>
                          <Input
                            id="new-password"
                            type="password"
                            placeholder="Enter new password"
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Confirm new password"
                          />
                        </div>
                        <Button>Update Password</Button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-neo-purple/20">
                      <h4 className="font-medium text-foreground mb-2">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add an extra layer of security to your account
                      </p>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>

                    <div className="pt-4 border-t border-neo-purple/20">
                      <h4 className="font-medium text-foreground mb-2 text-red-500">Danger Zone</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Permanently delete your account and all associated data
                      </p>
                      <Button variant="destructive">Delete Account</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;