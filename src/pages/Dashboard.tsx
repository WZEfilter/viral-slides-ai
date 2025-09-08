import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, Calendar, TrendingUp, Users, Zap, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useProfile } from "@/hooks/useProfile";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const Dashboard = () => {
  const { profile, loading } = useProfile();
  
  const remainingCredits = profile ? profile.credits_limit - profile.credits_used : 0;
  const remainingPercentage = profile ? (remainingCredits / profile.credits_limit) * 100 : 0;

  const stats = [
    { label: "Total Posts", value: "24", icon: TrendingUp, color: "neo-purple" },
    { label: "This Month", value: "8", icon: Calendar, color: "neo-pink" },
    { label: "Credits Left", value: remainingCredits.toString(), icon: Zap, color: "neo-blue" },
    { label: "Platforms", value: "3", icon: Users, color: "accent" },
  ];

  const currentScenarios = [
    { id: 1, title: "Tech Innovation Campaign", lastRun: "2 hours ago", scheduled: "Tomorrow 9:00 AM", status: "Scheduled" },
    { id: 2, title: "Business Growth Series", lastRun: "Yesterday", scheduled: "Next run in 3 days", status: "Active" },
    { id: 3, title: "Motivational Content", lastRun: null, scheduled: null, status: "Draft" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <Navigation />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
              </h1>
              <p className="text-muted-foreground">Manage your viral content creation</p>
            </div>
            <Link to="/create">
              <Button variant="hero" size="lg" className="group">
                <Plus className="mr-2 h-5 w-5" />
                Create Slideshow
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-6 bg-gradient-card border border-neo-purple/20 hover:border-neo-purple/40 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-${stat.color}/20`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Current Scenarios */}
            <div className="lg:col-span-2">
              <Card className="p-6 bg-gradient-card border border-neo-purple/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Current Scenarios</h2>
                  <Link to="/my-scenarios">
                    <Button variant="ghost" size="sm">View all</Button>
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {currentScenarios.map((scenario) => (
                    <div key={scenario.id} className="flex items-center justify-between p-4 bg-muted/10 rounded-lg border border-neo-purple/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-hero rounded flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{scenario.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {scenario.lastRun ? `Last run ${scenario.lastRun}` : 'Not run yet'}
                            {scenario.scheduled && ` • ${scenario.scheduled}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          scenario.status === 'Scheduled' ? 'bg-blue-500/20 text-blue-400' :
                          scenario.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {scenario.status}
                        </span>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card className="p-6 bg-gradient-card border border-neo-purple/20">
                <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link to="/create">
                    <Button variant="glass" className="w-full justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      New Slideshow
                    </Button>
                  </Link>
                  <Link to="/my-scenarios">
                    <Button variant="ghost" className="w-full justify-start">
                      <FolderOpen className="mr-2 h-4 w-4" />
                      My Scenarios
                    </Button>
                  </Link>
                  <Link to="/settings">
                    <Button variant="ghost" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Connect Platforms
                    </Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-card border border-neo-pink/20">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-neo-blue" />
                  <h3 className="font-semibold text-foreground">Credits Usage</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Used this month</span>
                    <span className="text-foreground font-medium">
                      {profile?.credits_used || 0} / {profile?.credits_limit || 100}
                    </span>
                  </div>
                  
                  <Progress 
                    value={remainingPercentage} 
                    className="h-3"
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>{remainingCredits} credits left</span>
                    <span>{profile?.credits_limit || 100}</span>
                  </div>
                </div>
                
                <Link to="/pricing" className="block mt-4">
                  <Button variant="neon" size="sm" className="w-full">
                    Upgrade Plan
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;