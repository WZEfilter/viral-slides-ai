import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, AlertCircle, Plus } from "lucide-react";
import { Platform } from "@/hooks/usePlatforms";
import { useState } from "react";

interface PlatformSelectorProps {
  platforms: Platform[];
  selectedPlatforms: string[];
  onSelectionChange: (platformIds: string[]) => void;
  className?: string;
}

export const PlatformSelector = ({
  platforms,
  selectedPlatforms,
  onSelectionChange,
  className
}: PlatformSelectorProps) => {
  const [showOnlyConnected, setShowOnlyConnected] = useState(false);
  
  const filteredPlatforms = showOnlyConnected 
    ? platforms.filter(p => p.connected)
    : platforms;

  const togglePlatform = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform?.connected) return;
    
    if (selectedPlatforms.includes(platformId)) {
      onSelectionChange(selectedPlatforms.filter(id => id !== platformId));
    } else {
      onSelectionChange([...selectedPlatforms, platformId]);
    }
  };

  return (
    <Card className={`p-6 bg-gradient-card border border-neo-purple/20 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Target Platforms</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Connected only</span>
          <Switch 
            checked={showOnlyConnected}
            onCheckedChange={setShowOnlyConnected}
          />
        </div>
      </div>
      
      <div className="grid gap-3">
        {filteredPlatforms.map((platform) => (
          <div
            key={platform.id}
            className={`
              p-4 rounded-lg border transition-all cursor-pointer
              ${platform.connected 
                ? selectedPlatforms.includes(platform.id)
                  ? 'border-neo-purple bg-neo-purple/10' 
                  : 'border-neo-purple/20 hover:border-neo-purple/40'
                : 'border-muted/20 opacity-50 cursor-not-allowed'
              }
            `}
            onClick={() => togglePlatform(platform.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{platform.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{platform.name}</span>
                    {platform.connected ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {platform.connected ? (
                      <>
                        <Badge variant="outline" className="text-xs">
                          {platform.accounts.length} account{platform.accounts.length !== 1 ? 's' : ''}
                        </Badge>
                        {!platform.capabilities.canPublish && (
                          <Badge variant="secondary" className="text-xs">
                            Draft only
                          </Badge>
                        )}
                      </>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Not connected
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {!platform.connected && (
                <Button variant="glass" size="sm">
                  <Plus className="h-3 w-3 mr-1" />
                  Connect
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {selectedPlatforms.length > 0 && (
        <div className="mt-4 p-3 bg-neo-purple/10 rounded-lg border border-neo-purple/20">
          <p className="text-sm text-foreground">
            Posting to {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </Card>
  );
};