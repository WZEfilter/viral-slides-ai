import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, DollarSign, Image, Play, Settings, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const WorkflowSection = () => {
  const { elementRef: headerRef, isVisible: headerVisible } = useIntersectionObserver();
  const { elementRef: stepsRef, isVisible: stepsVisible } = useIntersectionObserver();
  const { elementRef: contentTypesRef, isVisible: contentTypesVisible } = useIntersectionObserver();
  const { elementRef: ctaRef, isVisible: ctaVisible } = useIntersectionObserver();

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
        <div 
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
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
        <div 
          ref={stepsRef}
          className="grid md:grid-cols-4 gap-8 mb-20"
        >
          {workflowSteps.map((step, index) => (
            <div 
              key={index} 
              className={`relative transition-all duration-700 ${
                stepsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ 
                transitionDelay: stepsVisible ? `${index * 150}ms` : '0ms'
              }}
            >
              <Card className="bg-gradient-glass backdrop-blur-md border border-neo-purple/20 hover:border-neo-purple/40 transition-all duration-200 h-full hover:scale-105 hover:shadow-glow-primary">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="p-3 rounded-full bg-gradient-hero hover:scale-110 transition-transform duration-300">
                      <step.icon className="h-6 w-6 text-background" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
              {index < workflowSteps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="h-6 w-6 text-neo-purple animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Content Types */}
        <div 
          ref={contentTypesRef}
          className="grid lg:grid-cols-2 gap-12"
        >
          {/* Slideshow Images */}
          <div className={`bg-gradient-card backdrop-blur-md rounded-2xl p-8 border border-neo-purple/20 transition-all duration-700 hover:scale-105 hover:shadow-glow-primary ${
            contentTypesVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-full bg-gradient-to-r from-neo-purple to-neo-pink mr-4 hover:scale-110 transition-transform duration-300">
                <Image className="h-6 w-6 text-background" />
              </div>
              <h3 className="text-2xl font-bold">Slideshow Images</h3>
            </div>
            
            <p className="text-lg text-muted-foreground mb-6">
              Create stunning visual carousels that drive massive engagement on Instagram and Pinterest
            </p>

            <div className="space-y-4 mb-8">
              <div className={`flex items-center transition-all duration-500 ${
                contentTypesVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
              }`} style={{ transitionDelay: contentTypesVisible ? '300ms' : '0ms' }}>
                <TrendingUp className="h-5 w-5 text-neo-purple mr-3" />
                <span>Average 300% higher engagement than regular posts</span>
              </div>
              <div className={`flex items-center transition-all duration-500 ${
                contentTypesVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
              }`} style={{ transitionDelay: contentTypesVisible ? '400ms' : '0ms' }}>
                <TrendingUp className="h-5 w-5 text-neo-purple mr-3" />
                <span>Perfect for educational and lifestyle content</span>
              </div>
              <div className={`flex items-center transition-all duration-500 ${
                contentTypesVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
              }`} style={{ transitionDelay: contentTypesVisible ? '500ms' : '0ms' }}>
                <TrendingUp className="h-5 w-5 text-neo-purple mr-3" />
                <span>Optimized for platform algorithms</span>
              </div>
            </div>

            {/* Placeholder for TikTok Analytics */}
            <div className={`bg-muted/30 rounded-lg p-6 border-2 border-dashed border-muted-foreground/30 hover:border-neo-purple/40 transition-all duration-500 ${
              contentTypesVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`} style={{ transitionDelay: contentTypesVisible ? '600ms' : '0ms' }}>
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
          <div className={`bg-gradient-card backdrop-blur-md rounded-2xl p-8 border border-neo-pink/20 transition-all duration-700 hover:scale-105 hover:shadow-glow-accent ${
            contentTypesVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`} style={{ transitionDelay: contentTypesVisible ? '200ms' : '0ms' }}>
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-full bg-gradient-to-r from-neo-pink to-neo-blue mr-4 hover:scale-110 transition-transform duration-300">
                <Play className="h-6 w-6 text-background" />
              </div>
              <h3 className="text-2xl font-bold">Slideshow Videos</h3>
            </div>
            
            <p className="text-lg text-muted-foreground mb-6">
              Generate perfect 1:02 videos optimized for TikTok's monetization program
            </p>

            <div className="space-y-4 mb-8">
              <div className={`flex items-center transition-all duration-500 ${
                contentTypesVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`} style={{ transitionDelay: contentTypesVisible ? '500ms' : '0ms' }}>
                <DollarSign className="h-5 w-5 text-neo-pink mr-3" />
                <span>Eligible for TikTok Creator Fund</span>
              </div>
              <div className={`flex items-center transition-all duration-500 ${
                contentTypesVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`} style={{ transitionDelay: contentTypesVisible ? '600ms' : '0ms' }}>
                <DollarSign className="h-5 w-5 text-neo-pink mr-3" />
                <span>Optimized for maximum watch time</span>
              </div>
              <div className={`flex items-center transition-all duration-500 ${
                contentTypesVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`} style={{ transitionDelay: contentTypesVisible ? '700ms' : '0ms' }}>
                <DollarSign className="h-5 w-5 text-neo-pink mr-3" />
                <span>Brand partnership opportunities</span>
              </div>
            </div>

            {/* Placeholder for Earnings Analytics */}
            <div className={`bg-muted/30 rounded-lg p-6 border-2 border-dashed border-muted-foreground/30 hover:border-neo-pink/40 transition-all duration-500 ${
              contentTypesVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`} style={{ transitionDelay: contentTypesVisible ? '800ms' : '0ms' }}>
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
        <div 
          ref={ctaRef}
          className={`text-center mt-16 transition-all duration-700 ${
            ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Button variant="hero" size="lg" className="group hover:scale-105 transition-all duration-300">
            Start earning today
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;