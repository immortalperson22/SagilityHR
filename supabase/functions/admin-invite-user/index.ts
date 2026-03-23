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
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Unauthorized: Missing authorization header.");
    const token = authHeader.replace('Bearer ', '');
    
    // Validate caller is an Admin
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !caller) throw new Error("Unauthorized: Invalid session.");

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      throw new Error("Forbidden: Only administrators can invite members.");
    }

    // Get input data
    const { email, fullName, role, password } = await req.json();
    if (!email || !fullName || !role || !password) {
      throw new Error("Missing required fields (email, fullName, role, password).");
    }

    console.log(`Admin ${caller.email} is inviting ${email} as ${role}...`);

    // 1. Create User in Auth
    // auto_confirm ensures they don't need to click a link if SMTP limits are hit
    const { data: userData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    if (createUserError) {
      // Check if user already exists
      if (createUserError.message.includes("already registered")) {
        throw new Error("A user with this email address is already registered.");
      }
      throw new Error(`Failed to create auth user: ${createUserError.message}`);
    }

    const newUser = userData.user;

    // 2. Create Profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUser.id,
        full_name: fullName,
        email: email,
        is_completed: true
      });

    if (profileError) {
      console.error("Profile creation failed, cleaning up user...", profileError);
      await supabaseAdmin.auth.admin.deleteUser(newUser.id);
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }

    // 3. Create User Role
    const { error: userRoleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.id,
        role: role
      });

    if (userRoleError) {
      console.error("Role creation failed, cleaning up user/profile...", userRoleError);
      await supabaseAdmin.from('profiles').delete().eq('id', newUser.id);
      await supabaseAdmin.auth.admin.deleteUser(newUser.id);
      throw new Error(`Failed to assign user role: ${userRoleError.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `${role} invited successfully.`,
      userId: newUser.id 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error: any) {
    console.error("Admin Invite User Error:", error.message);
    const status = error.message.includes("Forbidden") ? 403 : error.message.includes("Unauthorized") ? 401 : 400;
    return new Response(JSON.stringify({ error: error.message }), {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});
