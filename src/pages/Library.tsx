import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  Play, 
  Calendar,
  Instagram,
  MessageCircle,
  MoreVertical,
  Eye,
  Heart,
  Share2
} from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

const Library = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const posts = [
    {
      id: 1,
      title: "Tech Innovation 2024",
      platform: "Instagram",
      type: "slideshow",
      status: "Published",
      date: "2 hours ago",
      slides: 6,
      views: "12.4K",
      likes: "892",
      thumbnail: "/api/placeholder/300/400",
      icon: Instagram,
      platformColor: "bg-gradient-to-br from-purple-500 to-pink-500"
    },
    {
      id: 2,
      title: "Business Growth Tips",
      platform: "TikTok",
      type: "video",
      status: "Draft",
      date: "5 hours ago",
      duration: "1:02",
      views: "8.2K",
      likes: "654",
      thumbnail: "/api/placeholder/300/400",
      icon: MessageCircle,
      platformColor: "bg-black"
    },
    {
      id: 3,
      title: "Motivational Quotes",
      platform: "Pinterest",
      type: "slideshow",
      status: "Scheduled",
      date: "1 day ago",
      slides: 8,
      views: "5.1K",
      likes: "421",
      thumbnail: "/api/placeholder/300/400",
      icon: Instagram,
      platformColor: "bg-red-600"
    },
    {
      id: 4,
      title: "Entrepreneurship Journey",
      platform: "Instagram",
      type: "video",
      status: "Published",
      date: "3 days ago",
      duration: "0:58",
      views: "18.7K",
      likes: "1.2K",
      thumbnail: "/api/placeholder/300/400",
      icon: Instagram,
      platformColor: "bg-gradient-to-br from-purple-500 to-pink-500"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Draft': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Content Library</h1>
              <p className="text-muted-foreground">Manage all your created content</p>
            </div>
            <Link to="/create">
              <Button variant="hero" className="group">
                <span>Create New</span>
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </Button>
            </Link>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gradient-glass border-neo-purple/20 focus:border-neo-purple/40"
              />
            </div>
            
            <Tabs value={filterType} onValueChange={setFilterType} className="w-auto">
              <TabsList className="bg-gradient-glass border border-neo-purple/20">
                <TabsTrigger value="all" className="data-[state=active]:bg-neo-purple data-[state=active]:text-background">
                  All Content
                </TabsTrigger>
                <TabsTrigger value="slideshow" className="data-[state=active]:bg-neo-purple data-[state=active]:text-background">
                  Slideshows
                </TabsTrigger>
                <TabsTrigger value="video" className="data-[state=active]:bg-neo-purple data-[state=active]:text-background">
                  Videos
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="group bg-gradient-card border border-neo-purple/20 hover:border-neo-purple/40 transition-all hover:shadow-glow-primary overflow-hidden">
                {/* Thumbnail */}
                <div className="relative aspect-[3/4] bg-gradient-to-br from-neo-purple/20 to-neo-pink/20 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-neo-purple/30 to-transparent" />
                  
                  {/* Platform Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <div className={`p-2 rounded-lg ${post.platformColor} shadow-lg`}>
                      <post.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className={`border ${getStatusColor(post.status)} backdrop-blur-sm`}>
                      {post.status}
                    </Badge>
                  </div>

                  {/* Play/View Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-sm">
                    <Button variant="glass" size="lg" className="group-hover:scale-110 transition-transform">
                      {post.type === 'video' ? (
                        <Play className="h-6 w-6" />
                      ) : (
                        <Eye className="h-6 w-6" />
                      )}
                    </Button>
                  </div>

                  {/* Type Indicator */}
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                      {post.type === 'video' ? `${post.duration}` : `${post.slides} slides`}
                    </Badge>
                  </div>
                </div>

                {/* Content Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">{post.platform} • {post.date}</p>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {post.views}
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {post.likes}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button variant="glass" size="sm" className="flex-1">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State or Load More */}
          {posts.length === 0 ? (
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