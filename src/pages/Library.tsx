import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useGeneratedContent } from "@/hooks/useGeneratedContent";
import { 
  Search, 
  Filter, 
  Download, 
  Play, 
  Calendar,
  Instagram,
  MessageCircle,
  MoreVertical,
  Eye,
  Share2,
  Plus,
  Zap,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

const Library = () => {
  const { content, loading } = useGeneratedContent();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Filter content based on search and type
  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || 
                       (filterType === 'slideshows' && item.content_type === 'slideshow_images') ||
                       (filterType === 'videos' && item.content_type === 'slideshow_video');
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'generating': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'published': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return Instagram;
      case 'tiktok': return MessageCircle;
      default: return Instagram;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return 'bg-gradient-to-br from-purple-500 to-pink-500';
      case 'tiktok': return 'bg-black';
      case 'pinterest': return 'bg-red-600';
      default: return 'bg-gradient-to-br from-purple-500 to-pink-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <Navigation />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Content Library</h1>
              <p className="text-muted-foreground">Manage your generated content and published posts</p>
            </div>
            <Link to="/create">
              <Button variant="hero" size="lg" className="group">
                <Plus className="mr-2 h-5 w-5" />
                Create New
              </Button>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/10 border-neo-purple/20 focus:border-neo-purple/40"
              />
            </div>
            <Button variant="outline" size="sm" className="shrink-0">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Content Type Tabs */}
          <div className="mb-8">
            <Tabs value={filterType} onValueChange={setFilterType}>
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="all">All Content</TabsTrigger>
                <TabsTrigger value="slideshows">Slideshows</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredContent.map((item) => {
              const PlatformIcon = getPlatformIcon(item.published_platforms?.[0] || 'instagram');
              const isVideo = item.content_type === 'slideshow_video';
              
              return (
                <Card key={item.id} className="group bg-gradient-card border border-neo-purple/20 hover:border-neo-purple/40 transition-all hover:shadow-glow-primary overflow-hidden">
                  {/* Thumbnail */}
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-neo-purple/20 to-neo-pink/20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-neo-purple/30 to-transparent" />
                    
                    {/* Platform Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <div className={`p-2 rounded-lg ${getPlatformColor(item.published_platforms?.[0] || 'instagram')} shadow-lg`}>
                        <PlatformIcon className="h-4 w-4 text-white" />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className={`border ${getStatusColor(item.status)} backdrop-blur-sm`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                    </div>

                    {/* Play/View Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-sm">
                      <Button variant="glass" size="lg" className="group-hover:scale-110 transition-transform">
                        {isVideo ? (
                          <Play className="h-6 w-6" />
                        ) : (
                          <Eye className="h-6 w-6" />
                        )}
                      </Button>
                    </div>

                    {/* Type Indicator */}
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                        {isVideo ? 'Video' : `${item.content_urls?.length || 0} slides`}
                      </Badge>
                    </div>

                    {/* Thumbnail Image */}
                    {item.thumbnail_url && (
                      <img 
                        src={item.thumbnail_url} 
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.published_platforms?.[0] || 'Not published'} • {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Zap className="h-4 w-4 mr-1" />
                          {item.credits_used || 0} credits
                        </div>
                        {item.status === 'completed' && (
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                            Ready
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button variant="glass" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Empty State or Load More */}
          {filteredContent.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-hero/20 flex items-center justify-center">
                  <Calendar className="h-12 w-12 text-neo-purple" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No content yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start creating viral content for your social media platforms
                </p>
                <Link to="/create">
                  <Button variant="hero">
                    Create Your First Post
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center mt-12">
              <Button variant="glass" size="lg">
                Load More Content
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;