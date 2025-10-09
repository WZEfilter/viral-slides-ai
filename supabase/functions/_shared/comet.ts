/**
 * Comet API Client for Seedance Video Generation
 * Handles video generation requests and callbacks
 */

const COMET_API_KEY = Deno.env.get('COMET_API_KEY');
const COMET_API_URL = 'https://api.cometapi.com/v1/video/generate';

export interface CometGenerationRequest {
  image_prompt: string;
  video_prompt: string;
  callbackUrl: string;
  duration?: number; // Duration in seconds (5-30)
  resolution?: '720p' | '1080p';
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

export interface CometGenerationResponse {
  success: boolean;
  task_id?: string;
  estimated_time?: number;
  error?: string;
}

/**
 * Submit video generation request to Comet API
 */
export async function generateVideo(
  request: CometGenerationRequest
): Promise<CometGenerationResponse> {
  try {
    const response = await fetch(COMET_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${COMET_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'seedance-1.0-pro',
        image_prompt: request.image_prompt,
        motion_prompt: request.video_prompt,
        callback_url: request.callbackUrl,
        duration: request.duration || 5, // 5-second base for looping
        resolution: request.resolution || '1080p',
        aspect_ratio: request.aspectRatio || '9:16', // TikTok vertical
        loop: false, // We'll handle looping client-side with FFmpeg
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Comet API error:', errorText);

      let errorMessage = `Comet API error: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    const data = await response.json();

    return {
      success: true,
      task_id: data.task_id || data.id,
      estimated_time: data.estimated_time || 120, // ~2 minutes typical
    };
  } catch (error) {
    console.error('Comet video generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Download video from Comet CDN
 * Returns video blob data
 */
export async function downloadVideo(
  videoUrl: string
): Promise<{ success: boolean; videoData?: Uint8Array; error?: string }> {
  try {
    const response = await fetch(videoUrl);

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to download video: ${response.status}`,
      };
    }

    const videoBlob = await response.blob();
    const arrayBuffer = await videoBlob.arrayBuffer();
    const videoData = new Uint8Array(arrayBuffer);

    return {
      success: true,
      videoData,
    };
  } catch (error) {
    console.error('Video download failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Upload video to Supabase Storage
 */
export async function uploadVideoToStorage(
  supabase: any,
  videoData: Uint8Array,
  storagePath: string,
  bucket: string = 'videos'
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, videoData, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath);

    return {
      success: true,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Video upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
