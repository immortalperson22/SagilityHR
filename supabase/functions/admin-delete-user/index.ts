import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Edge Function to securely delete a user and all associated data.
 * Must be called by an authenticated Admin.
 */
serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // 1. Create client with Service Role key (Admin privileges)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Get the auth token from the request to verify the CALLER
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("Unauthorized: Missing authorization header.");
    }
    const token = authHeader.replace('Bearer ', '');
    
    // 3. Create a secondary client to verify the caller's role securely
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !caller) {
      throw new Error("Unauthorized: Invalid session.");
    }

    // 4. Verify the caller is an ADMIN in the user_roles table
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      throw new Error("Forbidden: Only administrators can perform this action.");
    }

    // 5. Get the target userId from the request body
    const body = await req.json();
    const { userId } = body;
    if (!userId) {
      throw new Error("Missing userId in request body.");
    }

    // Prevent self-deletion
    if (userId === caller.id) {
      throw new Error("Cannot delete your own account.");
    }

    console.log(`Admin ${caller.id} ($${caller.email}) is deleting user ${userId}...`);

    // 6. Cleanup related data
    
    // A. Delete from Storage (bucket: applicant-docs)
    // We first fetch the applicant record to get file paths
    const { data: applicant } = await supabaseAdmin
      .from('applicants')
      .select('pre_employment_url, policy_rules_url')
      .eq('user_id', userId)
      .maybeSingle();

    const filesToRemove: string[] = [];
    
    if (applicant?.pre_employment_url) {
      // Extract storage path from signed URL if it's there, or use directly if it's a relative path
      const pathPart = applicant.pre_employment_url.split('/storage/v1/object/sign/')[1]?.split('?')[0];
      if (pathPart) filesToRemove.push(pathPart);
    }
    if (applicant?.policy_rules_url) {
      const pathPart = applicant.policy_rules_url.split('/storage/v1/object/sign/')[1]?.split('?')[0];
      if (pathPart) filesToRemove.push(pathPart);
    }

    if (filesToRemove.length > 0) {
      console.log(`Removing storage files: ${filesToRemove.join(', ')}`);
      await supabaseAdmin.storage.from('applicant-docs').remove(filesToRemove);
    }

    // B. Delete from Public Tables
    // Cascade should ideally handle this, but let's be explicit for safety
    console.log("Deleting rows from public tables...");
    await supabaseAdmin.from('applicants').delete().eq('user_id', userId);
    await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);
    await supabaseAdmin.from('profiles').delete().eq('user_id', userId);

    // 7. FINALLY: Delete user from Auth System
    console.log(`Deleting user from auth.users: ${userId}`);
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      throw new Error(`Auth Admin deletion failed: ${deleteError.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "User and all associated data deleted successfully." 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error: any) {
    console.error("Admin Delete User Error:", error.message);
    const status = error.message.includes("Forbidden") ? 403 : error.message.includes("Unauthorized") ? 401 : 400;
    return new Response(JSON.stringify({ error: error.message }), {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});
