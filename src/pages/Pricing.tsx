import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Check, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import Navigation from "@/components/Navigation";

const PricingPage = () => {
  const [additionalCredits, setAdditionalCredits] = useState([0]);
  
  const calculateAdditionalPrice = (additional: number) => {
    // $0.05 per additional credit
    return Math.ceil(additional * 0.05);
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "1 post every 3 days",
        "All templates available",
        "Draft/Publish to platforms",
        "Basic support",
      ],
      limitations: [
        "No scheduling",
      ],
      cta: "Start for free",
      variant: "glass" as const,
      popular: false,
    },
    {
      name: "Creator",
      price: `$${25 + calculateAdditionalPrice(additionalCredits[0])}`,
      period: "/month",
      description: `${200 + additionalCredits[0]} credits monthly`,
      subDescription: "200 base credits + additional credits. Rerolls & HQ models use more credits.",
      features: [
        "200 base credits included",
        `+${additionalCredits[0]} additional credits`,
        "1 account per platform",
        "Scheduling enabled",
        "Draft/Publish anywhere",
        "Premium support",
      ],
      cta: "Get Creator",
      variant: "neon" as const,
      popular: true,
    },
    {
      name: "Entrepreneur",
      price: `$${49 + calculateAdditionalPrice(additionalCredits[0] * 2)}`,
      period: "/month",
      description: `${200 + (additionalCredits[0] * 2)} credits monthly`,
      subDescription: "200 base credits + 2x additional credits. Rerolls & HQ models use more credits.",
      features: [
        "200 base credits included",
        `+${additionalCredits[0] * 2} additional credits`,
        "10 accounts per platform",
        "Scheduling enabled",
        "Draft/Publish anywhere",
        "Premium support",
      ],
      cta: "Get Entrepreneur",
      variant: "premium" as const,
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-foreground">Simple and transparent </span>
              <span className="bg-gradient-hero bg-clip-text text-transparent">pricing</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the plan that fits your investments. Scale credits with the slider for more posts.
            </p>
          </div>

          {/* Additional Credits Selector - Positioned above pricing cards */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-foreground mb-2">Customize Your Plan</h3>
              <p className="text-muted-foreground">All plans include 200 base credits. Add more credits to scale your content creation.</p>
            </div>
            <div className="bg-gradient-card border border-neo-purple/20 rounded-lg p-8">
              <div className="text-center mb-6">
                <div className="text-lg text-foreground mb-2">Additional Credits per Month</div>
                <div className="text-3xl font-bold text-neo-purple mb-2">
                  +{additionalCredits[0]} credits
                </div>
                <p className="text-sm text-muted-foreground">
                  Total: {200 + additionalCredits[0]} credits (≈ {Math.floor((200 + additionalCredits[0]) / 6)} posts)
                </p>
              </div>
              <Slider
                value={additionalCredits}
                onValueChange={setAdditionalCredits}
                min={0}
                max={1000}
                step={50}
                className="w-full mb-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>+0</span>
                <span>+1000</span>
              </div>
              <div className="text-center mt-4 text-sm text-muted-foreground">
                Additional credits: ${calculateAdditionalPrice(additionalCredits[0])}/month
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative p-8 bg-gradient-card border transition-all hover:border-neo-purple/40 hover:shadow-glow-primary flex flex-col h-full ${
                  plan.popular ? "border-neo-purple/60 shadow-glow-primary scale-105" : "border-neo-purple/20"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-hero px-4 py-2 rounded-full flex items-center space-x-2">
                      <Star className="h-4 w-4 text-background" />
                      <span className="text-sm font-semibold text-background">Popular</span>
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-neo-purple mb-2">
                    {plan.price}
                    <span className="text-lg text-muted-foreground font-normal">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                  {plan.subDescription && (
                    <p className="text-sm text-muted-foreground mt-1">{plan.subDescription}</p>
                  )}
                </div>

                <div className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-neo-purple mr-3 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations?.map((limitation) => (
                    <div key={limitation} className="flex items-center opacity-60">
                      <div className="h-5 w-5 mr-3 flex-shrink-0 flex items-center justify-center">
                        <div className="h-1 w-3 bg-muted-foreground rounded" />
                      </div>
                      <span className="text-muted-foreground">{limitation}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <Link to="/signup" className="block">
                    <Button variant={plan.variant} className="w-full">
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-8">Your Questions, Answered</h2>
            <p className="text-muted-foreground mb-12">
              Get instant answers to most common questions about ViralSlides AI.
            </p>
            
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                "How do I create and verify my ViralSlides AI account?",
                "How secure is ViralSlides AI with my digital assets?",
                "What social media platforms can I connect?",
                "What fees are associated with posting and transfers?",
              ].map((question) => (
                <div
                  key={question}
                  className="bg-gradient-card border border-neo-purple/20 rounded-lg p-6 text-left hover:border-neo-purple/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{question}</span>
                    <div className="text-2xl text-neo-purple">+</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;