import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface GeneratedContent {
  id: string;
  user_id: string;
  scenario_id: string | null;
  content_type: 'slideshow_images' | 'slideshow_video';
  title: string;
  status: 'generating' | 'completed' | 'failed' | 'published';
  prompt: string | null;
  credits_used: number;
  content_urls: string[];
  thumbnail_url: string | null;
  metadata: any;
  published_platforms: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateContentData {
  scenario_id?: string;
  content_type: 'slideshow_images' | 'slideshow_video';
  title: string;
  prompt?: string;
  credits_used: number;
  metadata?: any;
}

export const useGeneratedContent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadContent();
  }, [user]);

  const loadContent = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('generated_content')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent((data || []) as GeneratedContent[]);
    } catch (error: any) {
      console.error('Error loading generated content:', error);
      toast({
        title: "Error",
        description: "Failed to load generated content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createContent = async (contentData: CreateContentData): Promise<GeneratedContent | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('generated_content')
        .insert({
          user_id: user.id,
          ...contentData
        })
        .select()
        .single();

      if (error) throw error;

      setContent(prev => [data as GeneratedContent, ...prev]);
      return data as GeneratedContent;
    } catch (error: any) {
      console.error('Error creating content:', error);
      toast({
        title: "Error",
        description: "Failed to create content record",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateContent = async (id: string, updates: Partial<GeneratedContent>): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('generated_content')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setContent(prev => prev.map(item => 
        item.id === id ? (data as GeneratedContent) : item
      ));

      return true;
    } catch (error: any) {
      console.error('Error updating content:', error);
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteContent = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('generated_content')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setContent(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Success",
        description: "Content deleted successfully",
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting content:', error);
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
      return false;
    }
  };

  const getContentById = (id: string): GeneratedContent | undefined => {
    return content.find(item => item.id === id);
  };

  const getContentByStatus = (status: GeneratedContent['status']): GeneratedContent[] => {
    return content.filter(item => item.status === status);
  };

  const getContentByType = (type: GeneratedContent['content_type']): GeneratedContent[] => {
    return content.filter(item => item.content_type === type);
  };

  return {
    content,
    loading,
    createContent,
    updateContent,
    deleteContent,
    getContentById,
    getContentByStatus,
    getContentByType,
    refreshContent: loadContent
  };
};