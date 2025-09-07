import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Link } from "react-router-dom";
import { 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  MoreHorizontal
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { useScenarios } from "@/hooks/useScenarios";
import { formatDistanceToNow } from "date-fns";

const MyScenarios = () => {
  const { 
    scenarios, 
    loading, 
    pauseScenario, 
    resumeScenario, 
    deleteScenario,
    getScheduledScenarios,
    getUnscheduledScenarios 
  } = useScenarios();
  const [searchTerm, setSearchTerm] = useState("");

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

  const scheduledScenarios = getScheduledScenarios().filter(scenario =>
    scenario.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unscheduledScenarios = getUnscheduledScenarios().filter(scenario =>
    scenario.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePauseResume = async (scenario: any) => {
    if (scenario.is_paused) {
      await resumeScenario(scenario.id);
    } else {
      await pauseScenario(scenario.id);
    }
  };

  const formatLastRun = (lastRun: string | null) => {
    if (!lastRun) return "Never run";
    return `${formatDistanceToNow(new Date(lastRun))} ago`;
  };

  const formatNextRun = (nextRun: string | null) => {
    if (!nextRun) return null;
    return `Next: ${formatDistanceToNow(new Date(nextRun))}`;
  };

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

  const ScenarioCard = ({ scenario }: { scenario: any }) => (
    <Card className="neo-card hover:shadow-glow transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground mb-2">
              {scenario.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mb-3">
              {scenario.description || "No description"}
            </p>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {scenario.niche}
              </Badge>
              <Badge variant={getStatusColor(scenario)} className="text-xs">
                {getStatusText(scenario)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatLastRun(scenario.last_run_at)}</span>
            </div>
            {scenario.is_scheduled && scenario.next_run_at && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatNextRun(scenario.next_run_at)}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Link to={`/create?edit=${scenario.id}`}>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </Link>
            
            {scenario.is_scheduled && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handlePauseResume(scenario)}
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
              onClick={() => deleteScenario(scenario.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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