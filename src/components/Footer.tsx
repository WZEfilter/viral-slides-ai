import { Link } from "react-router-dom";
import { Zap, Instagram, MessageCircle, Globe, Mail, Twitter, Linkedin } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const Footer = () => {
  const { elementRef: footerRef, isVisible: footerVisible } = useIntersectionObserver();
  const { elementRef: newsletterRef, isVisible: newsletterVisible } = useIntersectionObserver();
  const { elementRef: bottomRef, isVisible: bottomVisible } = useIntersectionObserver();

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Overview", href: "/" },
      { name: "Features", href: "/features" },
      { name: "Pricing", href: "/pricing" },
      { name: "How it works", href: "/how-it-works" },
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Documentation", href: "/docs" },
      { name: "API Reference", href: "/api" },
      { name: "Status", href: "/status" },
    ],
    legal: [
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
      { name: "Security", href: "/security" },
      { name: "GDPR", href: "/gdpr" },
    ],
  };

  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "LinkedIn", icon: Linkedin, href: "#" },
    { name: "Instagram", icon: Instagram, href: "#" },
  ];

  return (
    <footer className="relative bg-gradient-primary border-t border-neo-purple/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neo-purple/10 via-transparent to-transparent" />
      
      <div 
        ref={footerRef}
        className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 transition-all duration-700 ${
          footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="grid lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className={`lg:col-span-2 transition-all duration-700 ${
            footerVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            <Link to="/" className="flex items-center space-x-2 mb-6 hover:scale-105 transition-transform duration-300">
              <div className="p-2 rounded-lg bg-gradient-hero">
                <Zap className="h-6 w-6 text-background" />
              </div>
              <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                ViralSlides AI
              </span>
            </Link>
            
            <p className="text-muted-foreground mb-6 max-w-md">
              Take control of your viral content. Generate stunning slideshow carousels and 
              1:02 videos for TikTok, Instagram & Pinterest with AI.
            </p>

            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={social.name}
                  href={social.href}
                  className={`p-2 rounded-lg bg-muted/10 text-muted-foreground hover:bg-neo-purple/20 hover:text-neo-purple transition-all duration-300 hover:scale-110 ${
                    footerVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  }`}
                  style={{ transitionDelay: footerVisible ? `${300 + (index * 100)}ms` : '0ms' }}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className={`lg:col-span-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-700 ${
            footerVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`} style={{ transitionDelay: footerVisible ? '200ms' : '0ms' }}>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link, index) => (
                  <li 
                    key={link.name}
                    className={`transition-all duration-500 ${
                      footerVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                    }`}
                    style={{ transitionDelay: footerVisible ? `${400 + (index * 50)}ms` : '0ms' }}
                  >
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-neo-purple transition-colors hover:translate-x-1 transform duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link, index) => (
                  <li 
                    key={link.name}
                    className={`transition-all duration-500 ${
                      footerVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                    }`}
                    style={{ transitionDelay: footerVisible ? `${600 + (index * 50)}ms` : '0ms' }}
                  >
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-neo-purple transition-colors hover:translate-x-1 transform duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link, index) => (
                  <li 
                    key={link.name}
                    className={`transition-all duration-500 ${
                      footerVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                    }`}
                    style={{ transitionDelay: footerVisible ? `${800 + (index * 50)}ms` : '0ms' }}
                  >
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-neo-purple transition-colors hover:translate-x-1 transform duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link, index) => (
                  <li 
                    key={link.name}
                    className={`transition-all duration-500 ${
                      footerVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                    }`}
                    style={{ transitionDelay: footerVisible ? `${1000 + (index * 50)}ms` : '0ms' }}
                  >
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-neo-purple transition-colors hover:translate-x-1 transform duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div 
          ref={newsletterRef}
          className={`mt-16 pt-8 border-t border-neo-purple/20 transition-all duration-700 ${
            newsletterVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className={`mb-6 md:mb-0 transition-all duration-700 ${
              newsletterVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Stay ahead of the viral curve
              </h3>
              <p className="text-muted-foreground">
                Get the latest tips, features, and updates delivered to your inbox.
              </p>
            </div>

            <div className={`flex w-full md:w-auto transition-all duration-700 ${
              newsletterVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`} style={{ transitionDelay: newsletterVisible ? '200ms' : '0ms' }}>
              <div className="relative flex-1 md:w-80">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-muted/10 border border-neo-purple/20 rounded-l-lg focus:border-neo-purple/40 focus:outline-none text-foreground transition-all duration-300 focus:scale-105"
                />
              </div>
              <button className="px-6 py-3 bg-gradient-hero text-background font-semibold rounded-r-lg hover:scale-105 transition-transform duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          ref={bottomRef}
          className={`mt-12 pt-8 border-t border-neo-purple/20 flex flex-col md:flex-row items-center justify-between transition-all duration-700 ${
            bottomVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className={`text-muted-foreground text-sm mb-4 md:mb-0 space-y-1 transition-all duration-700 ${
            bottomVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          }`}>
            <p>
              © {currentYear} REIYU STUDIO PTE. LTD. (UEN: 202524466H) — All rights reserved.
            </p>
            <p>
              Registered Address: 360 YISHUN RING ROAD, #02-1632, SINGAPORE 760360
            </p>
          </div>
          
          <div className={`flex items-center space-x-6 text-sm text-muted-foreground transition-all duration-700 ${
            bottomVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          }`} style={{ transitionDelay: bottomVisible ? '200ms' : '0ms' }}>
            <span>Made with ❤️ for creators</span>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <Instagram className="h-4 w-4 text-neo-purple hover:scale-110 transition-transform duration-300" />
                <MessageCircle className="h-4 w-4 text-neo-pink hover:scale-110 transition-transform duration-300" />
                <Globe className="h-4 w-4 text-neo-blue hover:scale-110 transition-transform duration-300" />
              </div>
              <span>platforms supported</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
