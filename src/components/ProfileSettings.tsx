import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { User, Mail, CreditCard, Crown } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  credits_used: number;
  credits_limit: number;
  subscription_tier: string;
  created_at: string;
  updated_at: string;
}

export const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        email: data.email || '',
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          email: formData.email,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        full_name: formData.full_name,
        email: formData.email,
        updated_at: new Date().toISOString(),
      } : null);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getSubscriptionBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'default';
      case 'premium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getSubscriptionIcon = (tier: string) => {
    switch (tier) {
      case 'pro':
      case 'premium':
        return <Crown className="h-3 w-3" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Profile data not found.</p>
        </CardContent>
      </Card>
    );
  }

  const creditsUsedPercentage = (profile.credits_used / profile.credits_limit) * 100;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Manage your personal information and account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-hero text-white text-lg">
                {profile.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">{profile.full_name || 'Anonymous User'}</h3>
                <Badge variant={getSubscriptionBadgeVariant(profile.subscription_tier)} className="flex items-center gap-1">
                  {getSubscriptionIcon(profile.subscription_tier)}
                  {profile.subscription_tier.charAt(0).toUpperCase() + profile.subscription_tier.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <p className="text-xs text-muted-foreground">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <Button 
            onClick={updateProfile}
            disabled={saving}
            className="w-full md:w-auto"
          >
            {saving ? <LoadingSpinner size="sm" /> : 'Update Profile'}
          </Button>
        </CardContent>
      </Card>

      {/* Credits & Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Credits & Subscription
          </CardTitle>
          <CardDescription>
            Monitor your credit usage and subscription status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Credits Used</p>
              <p className="text-sm text-muted-foreground">
                {profile.credits_used} of {profile.credits_limit} credits used
              </p>
            </div>
            <Badge variant="outline">
              {profile.credits_limit - profile.credits_used} remaining
            </Badge>
          </div>

          <div className="w-full bg-muted/20 rounded-full h-2">
            <div 
              className="bg-gradient-hero h-2 rounded-full transition-all" 
              style={{ width: `${Math.min(creditsUsedPercentage, 100)}%` }}
            />
          </div>

          {creditsUsedPercentage > 80 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <Mail className="h-4 w-4 text-yellow-500" />
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                You're running low on credits. Consider upgrading your plan.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="flex-1">
              View Usage History
            </Button>
            <Button variant="hero" className="flex-1">
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};