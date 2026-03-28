import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization')!;

    console.log('Invite function called');
    console.log('Auth header present:', !!authHeader);

    if (!authHeader) {
      throw new Error("Missing authorization header. Please log out and log back in.");
    }

    // Verify caller is admin using service role key directly
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

    const { email, fullName, role, password } = await req.json();

    // Create user using Auth Admin API
    const createUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      })
    });

    if (!createUserResponse.ok) {
      const errorData = await createUserResponse.json();
      throw new Error(errorData.msg || 'Failed to create user');
    }

    const userData = await createUserResponse.json();
    const userId = userData.id;

    // Create profile
    await fetch(`${supabaseUrl}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        user_id: userId,
        full_name: fullName,
        email: email
      })
    });

    // Create role
    await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        user_id: userId,
        role: role
      })
    });

    return new Response(JSON.stringify({ success: true, userId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Admin Invite User Error:', error.message);
    const status = error.message.includes("Forbidden") ? 403 : error.message.includes("Unauthorized") ? 401 : 400;
    return new Response(JSON.stringify({ error: error.message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
