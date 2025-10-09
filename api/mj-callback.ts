// Vercel Serverless Function: Webhook Proxy for Kie.ai callbacks
// Purpose: Accept unauthenticated webhooks from Kie.ai and forward to Supabase with auth

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { generation_id, image_index, token } = req.query;

    // Verify webhook secret
    const expectedSecret = process.env.MIDJOURNEY_WEBHOOK_SECRET || '';
    if (expectedSecret && token !== expectedSecret) {
      console.error('[Webhook Proxy] Invalid webhook secret');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Forward to Supabase Edge Function with proper authentication
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Webhook Proxy] Missing Supabase configuration');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/mj-callback?generation_id=${generation_id}&image_index=${image_index}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('[Webhook Proxy] Supabase function error:', data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('[Webhook Proxy] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
