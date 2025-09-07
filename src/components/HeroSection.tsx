import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroPhone from "@/assets/hero-phone-mockup.jpg";

const HeroSection = () => {
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
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-glass backdrop-blur-md border border-neo-purple/20 text-sm font-medium text-foreground mb-6 hover:border-neo-purple/40 transition-all animate-fade-in-down">
              <Sparkles className="h-4 w-4 mr-2 text-neo-purple" />
              AI-Powered Social Media Revolution
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
              <span className="block text-foreground">Take control of your</span>
              <span className="block bg-gradient-hero bg-clip-text text-transparent">
                Viral Content
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 animate-fade-in-up-delay">
              Generate stunning slideshow carousels and 1:02 videos for TikTok, Instagram & Pinterest. 
              <span className="text-neo-purple font-semibold"> Post directly or save as drafts.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up-delay-2">
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
            <div className="flex items-center justify-center lg:justify-start space-x-8 mt-12 text-sm text-muted-foreground animate-fade-in-up-delay-3">
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
          <div className="relative flex justify-center lg:justify-end animate-fade-in-right">
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