/**
 * Kie.ai MidJourney API Client
 * Handles image generation requests to Kie.ai proxy
 */

const KIE_API_KEY = Deno.env.get('KIE_API_KEY');
const KIE_API_URL = 'https://api.kie.ai/api/v1/mj/generate';

export interface KieGenerationRequest {
  prompt: string;
  callbackUrl: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  model?: 'mj_v7' | 'niji_6';
  quality?: 'fast' | 'relax' | 'turbo';
}

export interface KieGenerationResponse {
  success: boolean;
  request_id?: string;
  estimated_time?: number;
  error?: string;
}

/**
 * Submit image generation request to Kie.ai
 */
export async function generateImage(
  request: KieGenerationRequest
): Promise<KieGenerationResponse> {
  try {
    // Check if API key is set
    if (!KIE_API_KEY) {
      console.error('[Kie.ai] KIE_API_KEY environment variable is not set');
      return {
        success: false,
        error: 'KIE_API_KEY is not configured',
      };
    }

    console.log(`[Kie.ai] Generating image with prompt: "${request.prompt.substring(0, 50)}..."`);

    // Map model names to Kie.ai version format
    const version = request.model === 'niji_6' ? 'niji6' : '7';

    // Map quality to speed
    const speed = request.quality === 'relax' ? 'relaxed' : request.quality === 'turbo' ? 'turbo' : 'fast';

    // Build request body matching Kie.ai API structure
    const requestBody = {
      taskType: 'mj_txt2img',
      speed: speed,
      prompt: request.prompt,
      aspectRatio: request.aspectRatio || '9:16', // camelCase, not snake_case
      version: version,
      variety: 0,
      stylization: 300,
      weirdness: 0,
      waterMark: '',
      enableTranslation: false,
      callBackUrl: request.callbackUrl, // Capital B - this is critical!
    };

    console.log(`[Kie.ai] Request body:`, JSON.stringify(requestBody));

    const response = await fetch(KIE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIE_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`[Kie.ai] Response status: ${response.status}`);

    // Log full response for debugging
    const responseText = await response.text();
    console.log(`[Kie.ai] Raw response body:`, responseText);

    // Parse response
    let data;
    try {
      data = JSON.parse(responseText);
      console.log(`[Kie.ai] Parsed response data:`, JSON.stringify(data));
    } catch (error) {
      console.error(`[Kie.ai] Failed to parse response as JSON:`, error);
      return {
        success: false,
        error: `Invalid JSON response: ${responseText}`,
      };
    }

    // Kie.ai returns HTTP 200 even for errors - check the 'code' field
    // Success: { code: 200, msg: "success", data: { taskId: "..." } }
    // Error: { code: 422, msg: "不能为空", data: null }
    const apiCode = data?.code;
    if (!response.ok || (apiCode && apiCode !== 200)) {
      console.error('[Kie.ai] API error - HTTP status:', response.status, 'API code:', apiCode);

      const errorMessage = data?.msg || data?.error || data?.message || `Kie.ai API error (code: ${apiCode || response.status})`;

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Extract taskId from response
    const taskId = data?.data?.taskId || data?.taskId || data?.request_id || data?.id;

    if (!taskId) {
      console.error('[Kie.ai] No taskId in response:', data);
      return {
        success: false,
        error: 'No taskId returned from API',
      };
    }

    console.log(`[Kie.ai] Success! Task ID: ${taskId}`);

    return {
      success: true,
      request_id: taskId,
      estimated_time: data?.estimated_time || 60,
    };
  } catch (error) {
    console.error('Kie.ai generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Download image from Kie.ai CDN and upload to Supabase Storage
 */
export async function downloadAndUploadImage(
  imageUrl: string,
  supabase: any,
  storagePath: string
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  try {
    // Download image from Kie.ai
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to download image: ${response.status}`,
      };
    }

    const imageBlob = await response.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(storagePath, uint8Array, {
        contentType: 'image/png',
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
      .from('images')
      .getPublicUrl(storagePath);

    return {
      success: true,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Download/upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
