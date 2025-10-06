import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  Play, 
  Pause, 
  Edit, 
  Trash2
} from "lucide-react";
import Navigation from "@/components/Navigation";

const MyScenarios = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const scenarios = [
    { 
      id: '1', 
      title: 'Tech Innovation Campaign', 
      description: 'Daily tech updates and innovations',
      niche: 'technology',
      is_scheduled: true,
      is_paused: false,
      status: 'active',
      last_run_at: new Date(Date.now() - 7200000).toISOString(),
      next_run_at: new Date(Date.now() + 86400000).toISOString()
    },
    { 
      id: '2', 
      title: 'Business Growth Series', 
      description: 'Business tips and strategies',
      niche: 'business',
      is_scheduled: true,
      is_paused: false,
      status: 'active',
      last_run_at: new Date(Date.now() - 86400000).toISOString(),
      next_run_at: new Date(Date.now() + 259200000).toISOString()
    },
    { 
      id: '3', 
      title: 'Motivational Content', 
      description: 'Daily motivation and inspiration',
      niche: 'motivation',
      is_scheduled: false,
      is_paused: false,
      status: 'draft',
      last_run_at: null,
      next_run_at: null
    }
  ];

  const getStatusColor = (scenario: any) => {
    if (scenario.is_scheduled && !scenario.is_paused) return "default";
    if (scenario.is_scheduled && scenario.is_paused) return "secondary";
    if (scenario.status === 'active') return "default";
    return "outline";
  };

  const getStatusText = (scenario: any) => {
    if (scenario.is_scheduled && scenario.is_paused) return "Paused";
    if (scenario.is_scheduled) return "Scheduled";
    if (scenario.status === 'active') return "Active";
    return "Draft";
  };

  const filteredScenarios = scenarios.filter(scenario =>
    scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scenario.niche.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const scheduledScenarios = scenarios.filter(s => s.is_scheduled).filter(scenario =>
    scenario.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unscheduledScenarios = scenarios.filter(s => !s.is_scheduled).filter(scenario =>
    scenario.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastRun = (lastRun: string | null) => {
    if (!lastRun) return "Never run";
    const diff = Date.now() - new Date(lastRun).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  const formatNextRun = (nextRun: string | null) => {
    if (!nextRun) return null;
    const diff = new Date(nextRun).getTime() - Date.now();
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `Next: in ${hours} hours`;
    return `Next: in ${Math.floor(hours / 24)} days`;
  };

  const ScenarioCard = ({ scenario }: { scenario: any }) => {
    const successRate = Math.floor(Math.random() * 30) + 70; // 70-100%
    
    return (
      <Card className="group relative overflow-hidden neo-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <CardHeader className="pb-3 relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {scenario.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {scenario.niche}
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {scenario.description || "No description"}
              </p>
              
              <div className="flex items-center gap-2">
                <Badge variant={getStatusColor(scenario)} className="text-xs">
                  {getStatusText(scenario)}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-4 relative">
          {/* Performance bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Success Rate</span>
              <span className="text-foreground font-medium">{successRate}%</span>
            </div>
            <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-1000"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
          
          {/* Time info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 p-2 bg-muted/10 rounded-lg">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">Last Run</div>
                <div className="text-foreground font-medium">{formatLastRun(scenario.last_run_at)}</div>
              </div>
            </div>
            
            {scenario.is_scheduled && scenario.next_run_at && (
              <div className="flex items-center gap-2 p-2 bg-muted/10 rounded-lg">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Next Run</div>
                  <div className="text-foreground font-medium">{formatNextRun(scenario.next_run_at)}</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-neo-purple/10">
            <Link to={`/create?edit=${scenario.id}`} className="flex-1">
              <Button variant="ghost" size="sm" className="w-full">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </Link>
            
            {scenario.is_scheduled && (
              <Button 
                variant="ghost" 
                size="sm"
                className="flex-1"
              >
                {scenario.is_paused ? (
                  <><Play className="h-4 w-4 mr-1" /> Resume</>
                ) : (
                  <><Pause className="h-4 w-4 mr-1" /> Pause</>
                )}
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Scenarios</h1>
              <p className="text-muted-foreground">Manage and schedule your content scenarios</p>
            </div>
            <Link to="/create">
              <Button variant="hero" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create New Scenario
              </Button>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scenarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="all">All Scenarios</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="unscheduled">Unscheduled</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {filteredScenarios.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No scenarios found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? "Try adjusting your search terms" : "Create your first scenario to get started"}
                  </p>
                  <Link to="/create">
                    <Button variant="hero">
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Scenario
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredScenarios.map((scenario) => (
                    <ScenarioCard key={scenario.id} scenario={scenario} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-6">
              {scheduledScenarios.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No scheduled scenarios</h3>
                  <p className="text-muted-foreground mb-4">
                    Schedule your scenarios to automate content creation
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {scheduledScenarios.map((scenario) => (
                    <ScenarioCard key={scenario.id} scenario={scenario} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="unscheduled" className="space-y-6">
              {unscheduledScenarios.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No unscheduled scenarios</h3>
                  <p className="text-muted-foreground mb-4">
                    All your scenarios are scheduled
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {unscheduledScenarios.map((scenario) => (
                    <ScenarioCard key={scenario.id} scenario={scenario} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MyScenarios;