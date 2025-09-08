import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap, User, LayoutDashboard, Plus, FolderOpen, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const location = useLocation();
  const { isAuthenticated, user, signOut } = useAuth();

  // Scroll detection for section highlighting
  useEffect(() => {
    const handleScroll = () => {
      const featuresSection = document.getElementById('features');
      if (featuresSection && location.pathname === '/') {
        const featuresTop = featuresSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        // If features section is in the top half of the viewport, highlight it
        if (featuresTop <= windowHeight * 0.3) {
          setActiveSection("features");
        } else {
          setActiveSection("overview");
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Check if user is on dashboard pages
  const isDashboardPage = isAuthenticated && (
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/create') ||
    location.pathname.startsWith('/my-scenarios') ||
    location.pathname.startsWith('/settings')
  );

  const landingNavItems = [
    { name: "Overview", href: "/" },
    { name: "Features", href: "/#features", scroll: true },
    { name: "Pricing", href: "/pricing" },
  ];

  const dashboardNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Create", href: "/create", icon: Plus },
    { name: "My Scenarios", href: "/my-scenarios", icon: FolderOpen },
    { name: "Settings", href: "/settings", icon: SettingsIcon },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-neo-purple/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center min-w-0 flex-shrink-0">
            <Link 
              to={isAuthenticated ? "/dashboard" : "/"} 
              className="flex items-center space-x-2 group"
            >
              <div className="p-2 rounded-lg bg-gradient-hero">
                <Zap className="h-6 w-6 text-background" />
              </div>
              <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                ViralSlides AI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1 px-8">
            {isDashboardPage ? (
              <div className="flex items-center space-x-2">
                {dashboardNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href || 
                    (item.href === "/settings" && location.pathname.startsWith("/settings"));
                  
                  return (
                    <Link key={item.name} to={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className={`flex items-center gap-2 ${
                          isActive 
                            ? "bg-neo-purple text-background shadow-glow-primary" 
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="relative flex items-center space-x-1 bg-muted/50 rounded-full p-1">
                {/* Sliding indicator */}
                <div 
                  className={`absolute h-8 bg-neo-purple rounded-full shadow-glow-primary transition-all duration-300 ease-out ${
                    activeSection === "features" ? "translate-x-[100%] w-[88px]" : "translate-x-0 w-[88px]"
                  }`}
                />
                {landingNavItems.map((item, index) => (
                  item.scroll ? (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        const element = document.getElementById('features');
                        if (element) {
                          const navHeight = 64; // Height of fixed navigation
                          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                          const offsetPosition = elementPosition - navHeight;
                          
                          window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                          });
                        }
                      }}
                      className={`relative z-10 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                        activeSection === "features"
                          ? "text-background"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`relative z-10 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        (activeSection === "overview" && item.href === "/") ||
                        (location.pathname === item.href && item.href !== "/")
                          ? "text-background"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                ))}
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3 min-w-0 flex-shrink-0">
            {isAuthenticated ? (
              <>
                {!isDashboardPage && (
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem asChild>
                      <Link to="/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero" size="sm">
                    Get started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-neo-purple/20">
            <div className="flex flex-col space-y-3">
              {isDashboardPage ? (
                dashboardNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href || 
                    (item.href === "/settings" && location.pathname.startsWith("/settings"));
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-neo-purple text-background"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })
              ) : (
                landingNavItems.map((item) => (
                  item.scroll ? (
                    <a
                      key={item.name}
                      href={item.href}
                       onClick={(e) => {
                         e.preventDefault();
                         const element = document.getElementById('features');
                         if (element) {
                           const navHeight = 64; // Height of fixed navigation
                           const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                           const offsetPosition = elementPosition - navHeight;
                           
                           window.scrollTo({
                             top: offsetPosition,
                             behavior: 'smooth'
                           });
                         }
                         setIsOpen(false);
                       }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        location.pathname === "/" && location.hash === "#features"
                          ? "bg-neo-purple text-background"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        location.pathname === item.href
                          ? "bg-neo-purple text-background"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )
                ))
              )}
              <div className="flex flex-col space-y-2 pt-4 border-t border-neo-purple/20">
                {isAuthenticated ? (
                  <>
                    {!isDashboardPage && (
                      <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full">
                          Dashboard
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full" 
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full">
                        Log in
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="hero" size="sm" className="w-full">
                        Get started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;