import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroPhone from "@/assets/hero-phone-mockup.jpg";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const HeroSection = () => {
  const { elementRef: badgeRef, isVisible: badgeVisible } = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const { elementRef: headlineRef, isVisible: headlineVisible } = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const { elementRef: subtitleRef, isVisible: subtitleVisible } = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const { elementRef: buttonsRef, isVisible: buttonsVisible } = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const { elementRef: statsRef, isVisible: statsVisible } = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const { elementRef: visualRef, isVisible: visualVisible } = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-primary">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neo-purple/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-neo-purple/20 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-neo-pink/20 rounded-full blur-xl animate-float" style={{ animationDelay: "1s" }} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="text-center lg:text-left">
            {/* Main Headline */}
            <h1 
              ref={headlineRef}
              className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight transition-all duration-700 ${
                headlineVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: headlineVisible ? '200ms' : '0ms' }}
            >
              <span className="block bg-gradient-to-r from-white to-neo-purple bg-clip-text text-transparent">
                The #1 AI Tool for TikTok Slideshow Automation
              </span>
            </h1>

            {/* Subtitle */}
            <p 
              ref={subtitleRef}
              className={`text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 transition-all duration-700 ${
                subtitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: subtitleVisible ? '400ms' : '0ms' }}
            >
              Your 24/7 AI slideshow machine — post daily, grow fast, earn passively.
            </p>

            {/* CTA Buttons */}
            <div 
              ref={buttonsRef}
              className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start transition-all duration-700 ${
                buttonsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: buttonsVisible ? '600ms' : '0ms' }}
            >
              <Link to="/signup">
                <Button variant="hero" size="lg" className="group hover:scale-105 transition-all duration-300">
                  Start for free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="glass" size="lg" className="group hover:scale-105 transition-all duration-300">
                  <Play className="mr-2 h-5 w-5" />
                  Watch demo
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div 
              ref={statsRef}
              className={`flex items-center justify-center lg:justify-start space-x-8 mt-12 text-sm text-muted-foreground transition-all duration-700 ${
                statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: statsVisible ? '800ms' : '0ms' }}
            >
              <div className="text-center hover:scale-110 transition-transform duration-300">
                <div className="text-2xl font-bold text-neo-purple">50K+</div>
                <div>Posts Created</div>
              </div>
              <div className="text-center hover:scale-110 transition-transform duration-300">
                <div className="text-2xl font-bold text-neo-pink">10M+</div>
                <div>Views Generated</div>
              </div>
              <div className="text-center hover:scale-110 transition-transform duration-300">
                <div className="text-2xl font-bold text-neo-blue">98%</div>
                <div>Success Rate</div>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div 
            ref={visualRef}
            className={`relative flex justify-center lg:justify-end transition-all duration-700 ${
              visualVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
            style={{ transitionDelay: visualVisible ? '400ms' : '0ms' }}
          >
            {/* Main Phone */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-hero rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500" />
              <div className="relative bg-gradient-glass backdrop-blur-md rounded-3xl p-4 border border-neo-purple/20 shadow-glass hover:border-neo-purple/40 hover:scale-105 transition-all duration-500">
                <img
                  src={heroPhone}
                  alt="ViralSlides AI mobile app interface"
                  className="w-80 h-auto rounded-2xl"
                />
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -top-8 -left-8 bg-gradient-card backdrop-blur-md rounded-xl p-4 border border-neo-purple/20 animate-float hover:scale-110 transition-transform duration-300">
                <div className="text-sm font-semibold text-foreground">6 Slides Generated</div>
                <div className="text-xs text-muted-foreground">Ready to post</div>
              </div>
              
              <div className="absolute -bottom-8 -right-8 bg-gradient-card backdrop-blur-md rounded-xl p-4 border border-neo-pink/20 animate-float hover:scale-110 transition-transform duration-300" style={{ animationDelay: "0.5s" }}>
                <div className="text-sm font-semibold text-foreground">1:02 Video</div>
                <div className="text-xs text-muted-foreground">Auto-generated</div>
              </div>
            </div>

            {/* Secondary Phone */}
            <div className="absolute top-12 right-16 opacity-60 group-hover:opacity-80 transition-all duration-500 hover:scale-105">
              <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-2 border border-neo-purple/10 transform rotate-12 scale-75">
                <img
                  src={heroPhone}
                  alt="Secondary phone showing ViralSlides AI"
                  className="w-64 h-auto rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;