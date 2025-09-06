import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, DollarSign, Image, Play, Settings, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const WorkflowSection = () => {
  const workflowSteps = [
    {
      icon: Settings,
      title: "Set up your scenario",
      description: "Define your niche, target audience, and content style preferences"
    },
    {
      icon: Calendar,
      title: "Schedule",
      description: "Set your posting schedule and let AI handle the timing"
    },
    {
      icon: Play,
      title: "Post automatically",
      description: "Your content goes live across TikTok, Instagram & Pinterest"
    },
    {
      icon: DollarSign,
      title: "Earn money",
      description: "Generate revenue through TikTok monetization and brand partnerships"
    }
  ];

  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Your Path to Viral Success
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From setup to earnings, our AI handles everything so you can focus on growing your audience
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="grid md:grid-cols-4 gap-8 mb-20">
          {workflowSteps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="bg-gradient-glass backdrop-blur-md border border-neo-purple/20 hover:border-neo-purple/40 transition-all h-full">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="p-3 rounded-full bg-gradient-hero">
                      <step.icon className="h-6 w-6 text-background" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
              {index < workflowSteps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="h-6 w-6 text-neo-purple" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Content Types */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Slideshow Images */}
          <div className="bg-gradient-card backdrop-blur-md rounded-2xl p-8 border border-neo-purple/20">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-full bg-gradient-to-r from-neo-purple to-neo-pink mr-4">
                <Image className="h-6 w-6 text-background" />
              </div>
              <h3 className="text-2xl font-bold">Slideshow Images</h3>
            </div>
            
            <p className="text-lg text-muted-foreground mb-6">
              Create stunning visual carousels that drive massive engagement on Instagram and Pinterest
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-neo-purple mr-3" />
                <span>Average 300% higher engagement than regular posts</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-neo-purple mr-3" />
                <span>Perfect for educational and lifestyle content</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-neo-purple mr-3" />
                <span>Optimized for platform algorithms</span>
              </div>
            </div>

            {/* Placeholder for TikTok Analytics */}
            <div className="bg-muted/30 rounded-lg p-6 border-2 border-dashed border-muted-foreground/30">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h4 className="font-semibold mb-2">Engagement Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  Real TikTok engagement proof will be displayed here
                </p>
              </div>
            </div>
          </div>

          {/* Slideshow Videos */}
          <div className="bg-gradient-card backdrop-blur-md rounded-2xl p-8 border border-neo-pink/20">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-full bg-gradient-to-r from-neo-pink to-neo-blue mr-4">
                <Play className="h-6 w-6 text-background" />
              </div>
              <h3 className="text-2xl font-bold">Slideshow Videos</h3>
            </div>
            
            <p className="text-lg text-muted-foreground mb-6">
              Generate perfect 1:02 videos optimized for TikTok's monetization program
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-neo-pink mr-3" />
                <span>Eligible for TikTok Creator Fund</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-neo-pink mr-3" />
                <span>Optimized for maximum watch time</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-neo-pink mr-3" />
                <span>Brand partnership opportunities</span>
              </div>
            </div>

            {/* Placeholder for Earnings Analytics */}
            <div className="bg-muted/30 rounded-lg p-6 border-2 border-dashed border-muted-foreground/30">
              <div className="text-center">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h4 className="font-semibold mb-2">Earnings Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  Real TikTok monetization proof will be displayed here
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Button variant="hero" size="lg" className="group">
            Start earning today
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;