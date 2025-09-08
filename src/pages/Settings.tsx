import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import Navigation from '@/components/Navigation';
import DashboardNavigation from '@/components/DashboardNavigation';
import { ProfileSettings } from '@/components/ProfileSettings';
import { usePlatforms } from '@/hooks/usePlatforms';
import { useProfile } from '@/hooks/useProfile';
import { useCredits } from '@/hooks/useCredits';
import { useSearchParams } from 'react-router-dom';
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
  Globe,
  Check,
  Star,
  Zap,
  TrendingUp,
  Calendar
} from 'lucide-react';

const Settings = () => {
  const { platforms, getConnectedPlatforms } = usePlatforms();
  const { profile } = useProfile();
  const { availableCredits, usedThisMonth } = useCredits();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedPlan, setSelectedPlan] = useState('creator');
  const [additionalCredits, setAdditionalCredits] = useState('0');
  const [customCredits, setCustomCredits] = useState('');
  
  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'platforms', 'billing', 'security'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
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
      <DashboardNavigation />
      
      <div className="pt-8 pb-16">
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4">
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
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
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
              {/* Current Usage Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Current Usage & Plan
                  </CardTitle>
                  <CardDescription>
                    Your current plan usage and subscription details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Current Plan */}
                    <div className="p-4 bg-gradient-card border border-neo-purple/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold text-foreground">Free Plan</span>
                      </div>
                      <p className="text-sm text-muted-foreground">6 images every 3 days</p>
                    </div>
                    
                    {/* Current Usage */}
                    <div className="p-4 bg-gradient-card border border-neo-blue/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-neo-blue" />
                        <span className="font-semibold text-foreground">Current Period</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {usedThisMonth} / 6 images used
                      </p>
                      <Progress 
                        value={(6 - usedThisMonth) / 6 * 100} 
                        className="h-2 mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Resets every 3 days
                      </p>
                    </div>
                  </div>
                  
                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Free Plan:</strong> Get 6 images every 3 days. For unlimited usage and monthly credits that carry forward, upgrade to a paid plan.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Upgrade Plans */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Upgrade Your Plan
                  </CardTitle>
                  <CardDescription>
                    Scale your content creation with more credits and features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Creator Plan */}
                    <div className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedPlan === 'creator' 
                        ? 'border-neo-blue bg-neo-blue/5' 
                        : 'border-neo-purple/20 bg-gradient-card hover:border-neo-purple/40'
                    }`}
                    onClick={() => setSelectedPlan('creator')}>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="bg-neo-blue/20 text-neo-blue">
                          <Star className="h-3 w-3 mr-1" />
                          Most Popular
                        </Badge>
                        {selectedPlan === 'creator' && (
                          <Check className="h-5 w-5 text-neo-blue" />
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-foreground mb-2">Creator</h3>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-foreground">
                          ${25 + Math.round((additionalCredits === "custom" ? (parseInt(customCredits) || 0) : (parseInt(additionalCredits) || 0)) * 10) / 100}
                        </span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        {200 + (additionalCredits === "custom" ? (parseInt(customCredits) || 0) : (parseInt(additionalCredits) || 0))} credits monthly
                      </p>
                      
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          200 base credits included
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          1 account per platform
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          Scheduling enabled
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          Premium support
                        </li>
                      </ul>
                    </div>

                    {/* Entrepreneur Plan */}
                    <div className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedPlan === 'entrepreneur' 
                        ? 'border-neo-pink bg-neo-pink/5' 
                        : 'border-neo-purple/20 bg-gradient-card hover:border-neo-purple/40'
                    }`}
                    onClick={() => setSelectedPlan('entrepreneur')}>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="bg-neo-pink/20 text-neo-pink">
                          <Crown className="h-3 w-3 mr-1" />
                          Pro
                        </Badge>
                        {selectedPlan === 'entrepreneur' && (
                          <Check className="h-5 w-5 text-neo-pink" />
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-foreground mb-2">Entrepreneur</h3>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-foreground">
                          ${49 + Math.round((additionalCredits === "custom" ? (parseInt(customCredits) || 0) : (parseInt(additionalCredits) || 0)) * 10) / 100}
                        </span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        {200 + (additionalCredits === "custom" ? (parseInt(customCredits) || 0) : (parseInt(additionalCredits) || 0))} credits monthly
                      </p>
                      
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          200 base credits included
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          10 accounts per platform
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          Scheduling enabled
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          Premium support
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Additional Credits Selector */}
                  <div className="mt-6 p-4 bg-muted/10 rounded-lg">
                    <Label className="text-sm font-medium text-foreground mb-3 block">
                      Additional Credits (optional)
                    </Label>
                    <div className="flex gap-3 mb-3">
                      <Select value={additionalCredits} onValueChange={setAdditionalCredits}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose additional credits" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No additional credits</SelectItem>
                          <SelectItem value="100">+100 credits (+$10/month)</SelectItem>
                          <SelectItem value="250">+250 credits (+$25/month)</SelectItem>
                          <SelectItem value="500">+500 credits (+$50/month)</SelectItem>
                          <SelectItem value="1000">+1000 credits (+$100/month)</SelectItem>
                          <SelectItem value="custom">Custom amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {additionalCredits === "custom" && (
                      <Input
                        type="number"
                        placeholder="Enter custom credit amount"
                        value={customCredits}
                        onChange={(e) => setCustomCredits(e.target.value)}
                        className="mt-2"
                      />
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      Additional credits are charged at $0.10 per credit. Perfect for scaling your content creation.
                    </p>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="hero" size="lg" className="flex-1">
                      Upgrade to {selectedPlan === 'creator' ? 'Creator' : 'Entrepreneur'}
                    </Button>
                    <Button variant="outline" size="lg">
                      Learn More
                    </Button>
                  </div>
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