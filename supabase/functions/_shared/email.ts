/**
 * Email Notification Helper
 * Sends emails via Resend API
 */

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_EMAIL = 'ViralSlides.ai <noreply@viralslides.ai>';
const APP_URL = Deno.env.get('APP_URL') || 'https://viralslides.ai';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email via Resend API
 */
async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', errorText);
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (error) {
    console.error('Email send failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send generation complete notification
 */
export async function sendGenerationCompleteEmail(
  email: string,
  generationType: 'image' | 'video',
  scenarioTitle: string,
  generationId: string
): Promise<void> {
  const viewUrl = `${APP_URL}/history/${generationId}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Your Content is Ready!</h1>
    </div>
    <div class="content">
      <p>Great news! Your ${generationType} generation for <strong>"${scenarioTitle}"</strong> has completed successfully.</p>

      <p>Your ${generationType === 'video' ? '65-second looping video' : 'image slideshow'} is ready to be posted to TikTok!</p>

      <a href="${viewUrl}" class="button">View Your Content</a>

      <p style="margin-top: 30px;">If automatic posting is enabled, your content will be published to TikTok shortly.</p>
    </div>
    <div class="footer">
      <p>ViralSlides.ai - Automate Your TikTok Content</p>
      <p><a href="${APP_URL}/settings" style="color: #999;">Manage email preferences</a></p>
    </div>
  </div>
</body>
</html>
  `;

  await sendEmail({
    to: email,
    subject: `✅ Your ${generationType === 'video' ? 'Video' : 'Slideshow'} is Ready!`,
    html,
  });
}

/**
 * Send generation failed notification
 */
export async function sendGenerationFailedEmail(
  email: string,
  generationType: 'image' | 'video',
  scenarioTitle: string,
  creditsRefunded: number,
  errorMessage: string
): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .refund-box { background: #dcfce7; border: 1px solid #86efac; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Generation Failed</h1>
    </div>
    <div class="content">
      <p>Unfortunately, your ${generationType} generation for <strong>"${scenarioTitle}"</strong> encountered an error and could not be completed.</p>

      <div class="refund-box">
        <strong>✅ Credits Refunded: ${creditsRefunded}</strong><br>
        Your credits have been automatically refunded to your account.
      </div>

      <p><strong>Error Details:</strong><br>${errorMessage}</p>

      <p>This error has been logged and our team will investigate. You can try generating again, or contact support if the problem persists.</p>

      <a href="${APP_URL}/dashboard" class="button">Go to Dashboard</a>
    </div>
    <div class="footer">
      <p>ViralSlides.ai - Automate Your TikTok Content</p>
      <p><a href="${APP_URL}/settings" style="color: #999;">Contact Support</a></p>
    </div>
  </div>
</body>
</html>
  `;

  await sendEmail({
    to: email,
    subject: `❌ Generation Failed - ${creditsRefunded} Credits Refunded`,
    html,
  });
}

/**
 * Send low credits warning
 */
export async function sendLowCreditsEmail(
  email: string,
  currentCredits: number
): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .credits-box { background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; font-size: 24px; font-weight: bold; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ Running Low on Credits</h1>
    </div>
    <div class="content">
      <p>Your ViralSlides.ai credit balance is running low.</p>

      <div class="credits-box">
        ${currentCredits} Credits Remaining
      </div>

      <p>To avoid interruptions to your content generation:</p>
      <ul>
        <li><strong>Images:</strong> 1 credit per image</li>
        <li><strong>Videos:</strong> 12 credits per video</li>
      </ul>

      <p>Top up your credits to keep your TikTok content flowing!</p>

      <a href="${APP_URL}/settings" class="button">Buy More Credits</a>
    </div>
    <div class="footer">
      <p>ViralSlides.ai - Automate Your TikTok Content</p>
      <p><a href="${APP_URL}/settings" style="color: #999;">Manage email preferences</a></p>
    </div>
  </div>
</body>
</html>
  `;

  await sendEmail({
    to: email,
    subject: `⚡ Low Credits Warning - ${currentCredits} Remaining`,
    html,
  });
}

/**
 * Check if user wants email notifications (respects preferences)
 */
export async function shouldSendEmail(
  supabase: any,
  userId: string,
  emailType: 'generation' | 'credits' | 'errors'
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('email_preferences')
      .eq('id', userId)
      .single();

    if (error || !data) {
      // Default to sending if preferences not found
      return true;
    }

    const prefs = data.email_preferences || {};
    return prefs[emailType] !== false; // Send unless explicitly disabled
  } catch (error) {
    console.error('Error checking email preferences:', error);
    return true; // Default to sending on error
  }
}
