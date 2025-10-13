import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Running scheduler check...');

    // Get all active scenarios that are due to run
    const { data: scenarios, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('status', 'active')
      .lte('next_run_at', new Date().toISOString());

    if (error) throw error;

    console.log(`Found ${scenarios?.length || 0} scenarios to process`);

    for (const scenario of scenarios || []) {
      console.log(`Processing scenario: ${scenario.title}`);

      // Check if user has enough credits
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits_balance')
        .eq('id', scenario.user_id)
        .single();

      const creditsNeeded = scenario.type === 'image' ? scenario.image_count : 12;

      if (!profile || profile.credits_balance < creditsNeeded) {
        console.log(`Insufficient credits for scenario ${scenario.id}, pausing`);
        
        await supabase
          .from('scenarios')
          .update({ status: 'inactive' })
          .eq('id', scenario.id);

        continue;
      }

      // Create generation history entry
      const { data: generation } = await supabase
        .from('generation_history')
        .insert({
          user_id: scenario.user_id,
          scenario_id: scenario.id,
          type: scenario.type,
          original_prompt: scenario.prompt,
          status: 'generating',
          credits_used: creditsNeeded,
        })
        .select()
        .single();

      // Deduct credits
      await supabase
        .from('profiles')
        .update({
          credits_balance: profile.credits_balance - creditsNeeded,
        })
        .eq('id', scenario.user_id);

      await supabase
        .from('credit_transactions')
        .insert({
          user_id: scenario.user_id,
          amount: -creditsNeeded,
          type: 'deduction',
          description: `Generation for scenario: ${scenario.title}`,
          generation_id: generation?.id,
        });

      // Trigger generation (call other edge functions)
      // This would typically be done via background jobs or webhooks
      console.log(`Triggered generation for scenario ${scenario.id}`);

      // Calculate next run time
      let nextRunAt: Date;
      const now = new Date();

      if (scenario.schedule_type === 'daily') {
        nextRunAt = new Date(now);
        nextRunAt.setDate(nextRunAt.getDate() + 1);
        const [hours, minutes] = scenario.schedule_time.split(':');
        nextRunAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      } else {
        // Custom schedule - find next matching day
        const currentDay = now.getDay();
        const scheduleDays = scenario.schedule_days || [];
        const dayMap: { [key: string]: number } = {
          'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
        };
        
        const scheduledDayNumbers = scheduleDays.map(d => dayMap[d]).sort((a, b) => a - b);
        let daysToAdd = 1;
        
        for (let i = 0; i < 7; i++) {
          const checkDay = (currentDay + i + 1) % 7;
          if (scheduledDayNumbers.includes(checkDay)) {
            daysToAdd = i + 1;
            break;
          }
        }

        nextRunAt = new Date(now);
        nextRunAt.setDate(nextRunAt.getDate() + daysToAdd);
        const [hours, minutes] = scenario.schedule_time.split(':');
        nextRunAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }

      // Update next run time
      await supabase
        .from('scenarios')
        .update({ next_run_at: nextRunAt.toISOString() })
        .eq('id', scenario.id);

      console.log(`Next run scheduled for: ${nextRunAt.toISOString()}`);
    }

    // Clean up expired history
    await supabase.rpc('delete_expired_history');

    return new Response(JSON.stringify({
      processed: scenarios?.length || 0,
      message: 'Scheduler completed successfully',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in run-scheduler:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
