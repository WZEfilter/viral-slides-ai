import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Plus, 
  FolderOpen, 
  Settings, 
  BarChart3,
  Zap
} from "lucide-react";

const DashboardNavigation = () => {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Create", href: "/create", icon: Plus },
    { name: "My Scenarios", href: "/my-scenarios", icon: FolderOpen },
    { name: "Results", href: "/results", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md border-b border-neo-purple/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 py-3 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
              (item.href === "/settings" && location.pathname.startsWith("/settings"));
            
            return (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`flex items-center gap-2 whitespace-nowrap ${
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
      </div>
    </div>
  );
};

export default DashboardNavigation;