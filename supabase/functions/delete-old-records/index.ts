import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate 45 days ago
    const daysToKeep = 45;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffDateStr = cutoffDate.toISOString();

    console.log(`Checking for records older than: ${cutoffDateStr}`);

    // Get records older than 45 days that are approved or rejected
    const { data: oldRecords, error: fetchError } = await supabaseClient
      .from('applicants')
      .select('id, user_id, status, approved_at, rejected_at')
      .or('status.eq.approved,status.eq.rejected')
      .or(`approved_at.lt.${cutoffDateStr},rejected_at.lt.${cutoffDateStr}`);

    if (fetchError) {
      throw new Error(`Error fetching old records: ${fetchError.message}`);
    }

    if (!oldRecords || oldRecords.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No records to delete",
        deletedCount: 0 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    console.log(`Found ${oldRecords.length} records to delete`);

    // Delete records
    const recordIds = oldRecords.map(r => r.id);
    const userIds = oldRecords.map(r => r.user_id);

    // Delete from applicants table
    const { error: deleteError } = await supabaseClient
      .from('applicants')
      .delete()
      .in('id', recordIds);

    if (deleteError) {
      throw new Error(`Error deleting records: ${deleteError.message}`);
    }

    console.log(`Successfully deleted ${recordIds.length} records`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Deleted ${recordIds.length} records older than 45 days`,
      deletedCount: recordIds.length
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error: any) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});
