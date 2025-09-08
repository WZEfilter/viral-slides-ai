import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Zap, 
  Target, 
  Smartphone, 
  Clock, 
  Brain, 
  Palette,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const ProductDetailsSection = () => {
  const { elementRef: headerRef, isVisible: headerVisible } = useIntersectionObserver();
  const { elementRef: featuresRef, isVisible: featuresVisible } = useIntersectionObserver();
  const { elementRef: benefitsRef, isVisible: benefitsVisible } = useIntersectionObserver();
  const { elementRef: statsRef, isVisible: statsVisible } = useIntersectionObserver();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Content Creation",
      description: "Advanced AI analyzes trending content and generates viral-ready slideshows tailored to your niche"
    },
    {
      icon: Target,
      title: "Multi-Platform Optimization",
      description: "Content automatically optimized for TikTok, Instagram, and Pinterest algorithms"
    },
    {
      icon: Clock,
      title: "Automated Scheduling",
      description: "Smart scheduling system posts your content at peak engagement times across all platforms"
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "All content is created with mobile viewing in mind, ensuring maximum engagement"
    },
    {
      icon: Palette,
      title: "Brand Consistency",
      description: "Maintain your unique style and brand colors across all generated content"
    },
    {
      icon: Zap,
      title: "Instant Generation",
      description: "Create professional slideshow carousels and videos in under 30 seconds"
    }
  ];

  const benefits = [
    "Save 10+ hours per week on content creation",
    "Increase engagement rates by up to 300%",
    "Monetize your content through TikTok Creator Fund",
    "Build a consistent brand presence across platforms",
    "Access to trending topics and viral templates",
    "Real-time analytics and performance insights"
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div 
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need to 
            <span className="block bg-gradient-hero bg-clip-text text-transparent">
              Go Viral
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive AI platform handles every aspect of viral content creation, 
            from ideation to monetization
          </p>
        </div>

        {/* Features Grid */}
        <div 
          ref={featuresRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`bg-gradient-glass backdrop-blur-md border border-neo-purple/20 hover:border-neo-purple/40 transition-all duration-200 hover:scale-105 hover:shadow-glow-primary ${
                featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ 
                transitionDelay: featuresVisible ? `${index * 100}ms` : '0ms'
              }}
            >
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="p-3 rounded-full bg-gradient-hero w-fit hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 text-background" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div 
          ref={benefitsRef}
          className={`bg-gradient-card backdrop-blur-md rounded-2xl p-8 lg:p-12 border border-neo-purple/20 transition-all duration-700 ${
            benefitsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">
                Why Creators Choose
                <span className="block bg-gradient-hero bg-clip-text text-transparent">
                  ViralSlides AI
                </span>
              </h3>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of content creators who have transformed their social media presence 
                and started earning consistent revenue through our AI-powered platform.
              </p>
              <Button variant="hero" size="lg" className="group hover:scale-105 transition-all duration-300">
                Join the community
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className={`flex items-start transition-all duration-500 ${
                    benefitsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                  }`}
                  style={{ 
                    transitionDelay: benefitsVisible ? `${200 + (index * 100)}ms` : '0ms'
                  }}
                >
                  <CheckCircle className="h-6 w-6 text-neo-purple mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div 
          ref={statsRef}
          className="grid md:grid-cols-4 gap-8 mt-20"
        >
          <div className={`text-center transition-all duration-700 ${
            statsVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`} style={{ transitionDelay: statsVisible ? '100ms' : '0ms' }}>
            <div className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2 hover:scale-110 transition-transform duration-300">
              10M+
            </div>
            <div className="text-muted-foreground">Content pieces generated</div>
          </div>
          <div className={`text-center transition-all duration-700 ${
            statsVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`} style={{ transitionDelay: statsVisible ? '200ms' : '0ms' }}>
            <div className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2 hover:scale-110 transition-transform duration-300">
              $2M+
            </div>
            <div className="text-muted-foreground">Creator earnings facilitated</div>
          </div>
          <div className={`text-center transition-all duration-700 ${
            statsVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`} style={{ transitionDelay: statsVisible ? '300ms' : '0ms' }}>
            <div className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2 hover:scale-110 transition-transform duration-300">
              50K+
            </div>
            <div className="text-muted-foreground">Active creators</div>
          </div>
          <div className={`text-center transition-all duration-700 ${
            statsVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`} style={{ transitionDelay: statsVisible ? '400ms' : '0ms' }}>
            <div className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2 hover:scale-110 transition-transform duration-300">
              98%
            </div>
            <div className="text-muted-foreground">Success rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsSection;