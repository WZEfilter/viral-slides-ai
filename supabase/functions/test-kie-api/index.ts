// Edge Function: test-kie-api
// Purpose: Simple test to verify Kie.ai API key and connectivity
// NOTE: Public endpoint for testing only - no auth required

const KIE_API_KEY = Deno.env.get('KIE_API_KEY');
const KIE_API_URL = 'https://api.kie.ai/api/v1/mj/generate';

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    console.log('[Kie.ai Test] Starting API test...');
    console.log('[Kie.ai Test] API Key set:', KIE_API_KEY ? 'YES (length: ' + KIE_API_KEY.length + ')' : 'NO');
    console.log('[Kie.ai Test] API URL:', KIE_API_URL);

    if (!KIE_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'KIE_API_KEY environment variable is not set',
          help: 'Set KIE_API_KEY in Supabase Edge Function Secrets',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Test API call with correct Kie.ai payload structure
    const testPayload = {
      taskType: 'mj_txt2img',
      speed: 'fast',
      prompt: 'A simple test image of a sunset over mountains',
      aspectRatio: '1:1',
      version: '7',
      variety: 0,
      stylization: 300,
      weirdness: 0,
      waterMark: '',
      enableTranslation: false,
      callBackUrl: 'https://example.com/callback', // Capital B is critical!
    };

    console.log('[Kie.ai Test] Sending test request...');
    console.log('[Kie.ai Test] Payload:', JSON.stringify(testPayload));

    const response = await fetch(KIE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIE_API_KEY}`,
      },
      body: JSON.stringify(testPayload),
    });

    console.log('[Kie.ai Test] Response status:', response.status);
    console.log('[Kie.ai Test] Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));

    const responseText = await response.text();
    console.log('[Kie.ai Test] Response body (raw):', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('[Kie.ai Test] Response body (parsed):', JSON.stringify(responseData, null, 2));
    } catch (parseError) {
      console.error('[Kie.ai Test] Failed to parse response as JSON:', parseError);
      responseData = { raw: responseText, parseError: String(parseError) };
    }

    // Check both HTTP status and API response code
    const apiCode = responseData?.code;
    const isSuccess = response.ok && (!apiCode || apiCode === 200);

    if (!isSuccess) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Kie.ai API returned an error',
          http_status: response.status,
          api_code: apiCode,
          api_message: responseData?.msg,
          response: responseData,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Kie.ai API is working!',
        http_status: response.status,
        api_code: apiCode,
        task_id: responseData?.data?.taskId,
        response: responseData,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('[Kie.ai Test] Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
