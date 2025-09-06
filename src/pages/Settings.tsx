import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  CreditCard, 
  Bell, 
  Shield, 
  Instagram,
  MessageCircle,
  Globe,
  Plus,
  Check,
  X,
  Settings,
  Zap,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

const SettingsPage = () => {
  const [notifications, setNotifications] = useState({
    posts: true,
    credits: true,
    marketing: false,
  });

  const [platforms, setPlatforms] = useState([
    {
      id: "instagram",
      name: "Instagram",
      icon: Instagram,
      connected: true,
      accounts: 2,
      color: "bg-gradient-to-br from-purple-500 to-pink-500"
    },
    {
      id: "tiktok", 
      name: "TikTok",
      icon: MessageCircle,
      connected: true,
      accounts: 1,
      color: "bg-black"
    },
    {
      id: "pinterest",
      name: "Pinterest", 
      icon: Globe,
      connected: false,
      accounts: 0,
      color: "bg-red-600"
    }
  ]);

  const togglePlatform = (platformId: string) => {
    if (platformId === "pinterest") {
      // Show connection modal for Pinterest
      return;
    }
    setPlatforms(prev => 
      prev.map(p => 
        p.id === platformId 
          ? { ...p, connected: !p.connected }
          : p
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and integrations</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <Card className="p-6 bg-gradient-card border border-neo-purple/20">
                <nav className="space-y-2">
                  {[
                    { id: "profile", label: "Profile", icon: User },
                    { id: "platforms", label: "Platforms", icon: Globe },
                    { id: "billing", label: "Billing", icon: CreditCard },
                    { id: "notifications", label: "Notifications", icon: Bell },
                    { id: "security", label: "Security", icon: Shield },
                  ].map((item) => (
                    <button
                      key={item.id}
                      className="w-full flex items-center px-4 py-3 rounded-lg text-left text-foreground hover:bg-neo-purple/10 transition-colors"
                    >
                      <item.icon className="h-5 w-5 mr-3 text-neo-purple" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </Card>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Settings */}
              <Card className="p-6 bg-gradient-card border border-neo-purple/20">
                <div className="flex items-center mb-6">
                  <User className="h-5 w-5 mr-2 text-neo-purple" />
                  <h2 className="text-xl font-semibold text-foreground">Profile</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                      <Input
                        id="firstName"
                        defaultValue="John"
                        className="mt-1 bg-muted/10 border-neo-purple/20 focus:border-neo-purple/40"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                      <Input
                        id="lastName"
                        defaultValue="Doe"
                        className="mt-1 bg-muted/10 border-neo-purple/20 focus:border-neo-purple/40"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="john@example.com"
                      className="mt-1 bg-muted/10 border-neo-purple/20 focus:border-neo-purple/40"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="timezone" className="text-foreground">Timezone</Label>
                    <Input
                      id="timezone"
                      defaultValue="Pacific Standard Time (PST)"
                      className="mt-1 bg-muted/10 border-neo-purple/20 focus:border-neo-purple/40"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button variant="hero">Save Changes</Button>
                  </div>
                </div>
              </Card>

              {/* Platform Connections */}
              <Card className="p-6 bg-gradient-card border border-neo-purple/20">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-neo-purple" />
                    <h2 className="text-xl font-semibold text-foreground">Connected Platforms</h2>
                  </div>
                  <Badge className="bg-neo-purple/20 text-neo-purple border-neo-purple/30">
                    Creator Plan
                  </Badge>
                </div>

                <div className="space-y-4">
                  {platforms.map((platform) => (
                    <div key={platform.id} className="flex items-center justify-between p-4 rounded-lg border border-neo-purple/20 hover:border-neo-purple/40 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${platform.color}`}>
                          <platform.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-foreground">{platform.name}</h3>
                            {platform.connected ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <X className="h-4 w-4 text-red-400" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {platform.connected 
                              ? `${platform.accounts} account${platform.accounts !== 1 ? 's' : ''} connected`
                              : "Not connected"
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {platform.connected && (
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant={platform.connected ? "ghost" : "neon"}
                          size="sm"
                          onClick={() => togglePlatform(platform.id)}
                        >
                          {platform.connected ? "Disconnect" : "Connect"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6 bg-neo-purple/20" />
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Need more accounts? Upgrade to Entrepreneur plan for 5 accounts per platform.
                  </p>
                  <Link to="/pricing">
                    <Button variant="premium">
                      <Plus className="h-4 w-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Billing & Credits */}
              <Card className="p-6 bg-gradient-card border border-neo-purple/20">
                <div className="flex items-center mb-6">
                  <CreditCard className="h-5 w-5 mr-2 text-neo-purple" />
                  <h2 className="text-xl font-semibold text-foreground">Billing & Credits</h2>
                </div>

                <div className="space-y-6">
                  {/* Current Plan */}
                  <div className="p-4 rounded-lg bg-gradient-glass border border-neo-purple/20">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground">Creator Plan</h3>
                        <p className="text-sm text-muted-foreground">$20/month • 180 credits</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Active
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Zap className="h-4 w-4 mr-2 text-neo-purple" />
                          <span className="text-sm text-foreground">Credits remaining</span>
                        </div>
                        <span className="font-semibold text-neo-purple">156 / 180</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm text-foreground">Next billing</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Jan 15, 2024</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Link to="/pricing">
                      <Button variant="neon">Change Plan</Button>
                    </Link>
                    <Button variant="ghost">Billing History</Button>
                    <Button variant="ghost">Cancel Subscription</Button>
                  </div>
                </div>
              </Card>

              {/* Notifications */}
              <Card className="p-6 bg-gradient-card border border-neo-purple/20">
                <div className="flex items-center mb-6">
                  <Bell className="h-5 w-5 mr-2 text-neo-purple" />
                  <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
                </div>

                <div className="space-y-4">
                  {[
                    { id: "posts", label: "Post updates", description: "Get notified when posts are published or fail" },
                    { id: "credits", label: "Credit alerts", description: "Alerts when credits are running low" },
                    { id: "marketing", label: "Marketing emails", description: "Tips, features, and promotional content" },
                  ].map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between py-3">
                      <div>
                        <h4 className="font-medium text-foreground">{setting.label}</h4>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <Switch
                        checked={notifications[setting.id as keyof typeof notifications]}
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({ ...prev, [setting.id]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;