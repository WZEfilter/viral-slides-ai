import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, Calendar, TrendingUp, Users, Zap, FolderOpen, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

const Dashboard = () => {
  const stats = [
    { 
      label: "Total Posts", 
      value: "24", 
      change: "+12%",
      trend: "up",
      icon: TrendingUp, 
      gradient: "from-purple-500 to-pink-500",
      chartData: [20, 45, 28, 80, 50, 82, 65]
    },
    { 
      label: "This Month", 
      value: "8", 
      change: "+3",
      trend: "up",
      icon: Calendar, 
      gradient: "from-blue-500 to-cyan-500",
      chartData: [30, 20, 40, 35, 50, 45, 60]
    },
    { 
      label: "Credits Left", 
      value: "75", 
      change: "-25",
      trend: "down",
      icon: Zap, 
      gradient: "from-cyan-500 to-blue-500",
      chartData: [100, 95, 85, 80, 78, 76, 75]
    },
    { 
      label: "Engagement", 
      value: "84%", 
      change: "+7%",
      trend: "up",
      icon: Users, 
      gradient: "from-pink-500 to-purple-500",
      chartData: [60, 65, 70, 68, 75, 80, 84]
    },
  ];

  const currentScenarios = [
    { id: 1, title: "Tech Innovation Campaign", lastRun: "2 hours ago", scheduled: "Tomorrow 9:00 AM", status: "Scheduled" },
    { id: 2, title: "Business Growth Series", lastRun: "Yesterday", scheduled: "Next run in 3 days", status: "Active" },
    { id: 3, title: "Motivational Content", lastRun: null, scheduled: null, status: "Draft" },
  ];

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back!
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
            {stats.map((stat, index) => (
              <Card 
                key={stat.label} 
                className="group relative overflow-hidden bg-gradient-card border border-neo-purple/20 hover:border-neo-purple/40 transition-all duration-300 hover:shadow-glow"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity" 
                     style={{ background: `linear-gradient(135deg, hsl(var(--neo-purple)), hsl(var(--neo-pink)))` }} />
                
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                      <div className="flex items-center gap-1">
                        {stat.trend === "up" ? (
                          <ArrowUpRight className="h-3 w-3 text-green-400" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-400" />
                        )}
                        <span className={`text-xs font-medium ${stat.trend === "up" ? "text-green-400" : "text-red-400"}`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} opacity-20 group-hover:opacity-30 transition-opacity`}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  
                  {/* Mini sparkline chart */}
                  <div className="flex items-end gap-1 h-12">
                    {stat.chartData.map((height, i) => (
                      <div 
                        key={i} 
                        className={`flex-1 rounded-t bg-gradient-to-t ${stat.gradient} opacity-50 group-hover:opacity-70 transition-all duration-300`}
                        style={{ 
                          height: `${height}%`,
                          animationDelay: `${i * 50}ms`
                        }}
                      />
                    ))}
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

              <Card className="relative overflow-hidden bg-gradient-card border border-neo-pink/20">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5" />
                
                <div className="relative p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Zap className="h-5 w-5 text-neo-blue" />
                    <h3 className="font-semibold text-foreground">Credits Usage</h3>
                  </div>
                  
                  {/* Circular progress */}
                  <div className="flex justify-center mb-6">
                    <div className="relative w-40 h-40">
                      {/* Background circle */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="hsl(var(--muted))"
                          strokeWidth="12"
                          fill="none"
                          opacity="0.2"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="url(#gradient)"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 70}`}
                          strokeDashoffset={`${2 * Math.PI * 70 * (1 - 0.75)}`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="hsl(var(--neo-purple))" />
                            <stop offset="100%" stopColor="hsl(var(--neo-blue))" />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      {/* Center text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-foreground">75</span>
                        <span className="text-xs text-muted-foreground">credits left</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Available</span>
                      <span className="text-foreground font-medium">75 / 100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Used this month</span>
                      <span className="text-foreground font-medium">25</span>
                    </div>
                  </div>
                  
                  <Link to="/settings?tab=billing" className="block">
                    <Button variant="neon" size="sm" className="w-full group">
                      Upgrade Plan
                      <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;