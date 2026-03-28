import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization')!;

    console.log('Delete function called');
    console.log('Auth header present:', !!authHeader);

    if (!authHeader) {
      throw new Error("Missing authorization header. Please log out and log back in.");
    }

    // Verify caller is admin
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': authHeader,
        'apikey': supabaseServiceKey
      }
    });

    const userResponseText = await userResponse.text();
    console.log('User response status:', userResponse.status);
    console.log('User response body:', userResponseText);

    if (!userResponse.ok) {
      throw new Error(`Unauthorized: ${userResponseText}`);
    }

    const caller = JSON.parse(userResponseText);

    // Check if caller is admin
    const roleResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_roles?user_id=eq.${caller.id}&select=role`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        }
      }
    );

    const roles = await roleResponse.json();
    if (!roles || !roles[0] || roles[0].role !== 'admin') {
      throw new Error(`Forbidden: Only administrators can perform this action.`);
    }

    // Process deletion
    const { userId } = await req.json();
    if (!userId) {
      throw new Error("Missing userId in request body.");
    }

    if (userId === caller.id) {
      throw new Error("Cannot delete your own account.");
    }

    // Delete from tables
    const tables = ['applicants', 'user_roles', 'profiles'];
    for (const table of tables) {
      await fetch(`${supabaseUrl}/rest/v1/${table}?user_id=eq.${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        }
      });
    }

    // Delete from Auth
    const deleteResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      }
    });

    if (!deleteResponse.ok) {
      throw new Error("Failed to delete user from auth.");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "User deleted successfully." 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error: any) {
    console.error("Admin Delete User Error:", error.message);
    const status = error.message.includes("Forbidden") ? 403 : error.message.includes("Unauthorized") ? 401 : 400;
    return new Response(JSON.stringify({ 
      error: error.message,
      diagnostic: "This error usually means your login session is stale. Please try logging out and logging back in."
    }), {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});
