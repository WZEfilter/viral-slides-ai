/**
 * OpenAI API Helper
 * Handles prompt expansion for image and video generation
 */

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Call OpenAI API with retry logic
 */
async function callOpenAI(
  messages: OpenAIMessage[],
  temperature: number = 0.8
): Promise<string> {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Cost-effective model
        messages,
        temperature,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    throw error;
  }
}

/**
 * Expand image prompts - Generate N varied prompts from base prompt
 * Returns array of detailed prompts + TikTok caption
 */
export async function expandImagePrompts(
  basePrompt: string,
  imageCount: number
): Promise<{ prompts: string[]; caption: string } | null> {
  const systemPrompt = `You are a creative AI assistant specialized in generating diverse, detailed image prompts for MidJourney.

Given a base prompt, create ${imageCount} UNIQUE and VARIED prompts that explore different aspects, styles, and interpretations.
Each prompt should be detailed, specific, and optimized for high-quality image generation.

Also create an engaging TikTok caption (max 150 characters) for the slideshow.

Return your response as JSON:
{
  "prompts": ["prompt1", "prompt2", ...],
  "caption": "Your TikTok caption here"
}`;

  const userPrompt = `Base prompt: "${basePrompt}"

Generate ${imageCount} varied prompts exploring different:
- Styles (realistic, artistic, cinematic, abstract, etc.)
- Perspectives (close-up, wide angle, aerial, etc.)
- Moods (dramatic, peaceful, energetic, mysterious, etc.)
- Lighting (golden hour, neon, natural, dramatic, etc.)

Make each prompt detailed and distinct. Include technical photography terms.`;

  try {
    const response = await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], 0.9); // High temperature for creativity

    // Parse JSON response
    const parsed = JSON.parse(response);

    if (!parsed.prompts || !Array.isArray(parsed.prompts) || parsed.prompts.length !== imageCount) {
      throw new Error('Invalid OpenAI response format');
    }

    return {
      prompts: parsed.prompts,
      caption: parsed.caption || basePrompt.slice(0, 150),
    };
  } catch (error) {
    console.error('Image prompt expansion failed:', error);
    // Fallback: use base prompt for all images
    return null;
  }
}

/**
 * Expand video prompt - Generate image_prompt and video_prompt
 * Returns detailed prompts for Comet Seedance video generation
 */
export async function expandVideoPrompt(
  basePrompt: string
): Promise<{ image_prompt: string; video_prompt: string; caption: string } | null> {
  const systemPrompt = `You are a creative AI assistant specialized in generating prompts for AI video generation (Comet Seedance model).

The video generation process works in two steps:
1. First, an image is generated from the image_prompt
2. Then, that image is animated based on the video_prompt

Create:
- image_prompt: Detailed description of the starting frame/scene
- video_prompt: Description of the movement, animation, and motion
- caption: Engaging TikTok caption (max 150 characters)

Return your response as JSON:
{
  "image_prompt": "Detailed scene description...",
  "video_prompt": "Movement and animation description...",
  "caption": "Your TikTok caption"
}`;

  const userPrompt = `Base idea: "${basePrompt}"

Create prompts for a looping 65-second video (will be used as TikTok wallpaper).
The video should be:
- Visually captivating and mesmerizing
- Smooth, looping motion (no jarring transitions)
- Suitable for vertical 9:16 format
- Aesthetically pleasing for background viewing

Focus on:
- Ambient, flowing movements
- Natural or abstract patterns
- Calming or energetic vibes (match the base prompt)
- Camera movements (slow zoom, pan, rotation, etc.)`;

  try {
    const response = await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], 0.8);

    // Parse JSON response
    const parsed = JSON.parse(response);

    if (!parsed.image_prompt || !parsed.video_prompt) {
      throw new Error('Invalid OpenAI response format');
    }

    return {
      image_prompt: parsed.image_prompt,
      video_prompt: parsed.video_prompt,
      caption: parsed.caption || basePrompt.slice(0, 150),
    };
  } catch (error) {
    console.error('Video prompt expansion failed:', error);
    // Fallback: use base prompt
    return null;
  }
}

/**
 * Fallback: Create simple prompts from base prompt
 */
export function createFallbackImagePrompts(
  basePrompt: string,
  count: number
): { prompts: string[]; caption: string } {
  const prompts = Array(count).fill(basePrompt);
  return {
    prompts,
    caption: basePrompt.slice(0, 150),
  };
}

/**
 * Fallback: Create simple video prompts from base prompt
 */
export function createFallbackVideoPrompt(
  basePrompt: string
): { image_prompt: string; video_prompt: string; caption: string } {
  return {
    image_prompt: basePrompt,
    video_prompt: 'Smooth camera movement, cinematic, looping animation',
    caption: basePrompt.slice(0, 150),
  };
}
