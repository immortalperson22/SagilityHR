import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import nodemailer from "https://esm.sh/nodemailer@6.9.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const record = payload.record;

    console.log("Processing approval for applicant ID:", record?.id);

    if (!record || record.status !== 'approved') {
      return new Response(JSON.stringify({ message: "Not a valid approval event" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch Applicant & Profile details
    const { data: applicant, error: applicantError } = await supabaseClient
      .from('applicants')
      .select(`
        *,
        profiles (
          full_name
        )
      `)
      .eq('id', record.id)
      .single();

    if (applicantError || !applicant) {
      throw new Error(`Applicant data retrieval failed: ${applicantError?.message || 'Not found'}`);
    }

    // 2. Fetch User Email from Auth (since profiles table lacks email column)
    const { data: { user }, error: authError } = await supabaseClient.auth.admin.getUserById(applicant.user_id);

    if (authError || !user) {
      throw new Error(`Auth metadata lookup failed: ${authError?.message || 'User not found'}`);
    }

    const applicantName = applicant.profiles?.full_name || 'New Employee';
    const applicantEmail = user.email || 'N/A';
    const preUrl = applicant.pre_employment_url;
    const policyUrl = applicant.policy_rules_url;

    // SMTP Configuration
    const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com';
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASS');

    if (!smtpUser || !smtpPass) {
      throw new Error("SMTP_USER or SMTP_PASS secrets are not configured.");
    }

    // Send to actual applicant email
    const recipient = applicantEmail;

    // 3. Create Transporter (Nodemailer)
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const subject = `[Sagility] Onboarding Approved: ${applicantName}`;
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0d9488; text-align: center;">Sagility Onboarding Approval</h2>
        <p>Hello,</p>
        <p>Congratulations! An onboarding application for <strong>${applicantName}</strong> has been approved.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <p><strong>Employee:</strong> ${applicantName}</p>
          <p><strong>Login Email:</strong> ${applicantEmail}</p>
        </div>

        <h3>Signed Documents (PDF)</h3>
        <p><a href="${preUrl}" style="color: #0d9488; font-weight: bold;">View Pre-Employment Form</a></p>
        <p><a href="${policyUrl}" style="color: #0d9488; font-weight: bold;">View Policy Rules</a></p>
        
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 50px;">
          This message was sent automatically by Sagility.
        </p>
      </div>
    `;

    console.log(`Sending email to ${recipient}...`);

    // 4. Send the email
    await transporter.sendMail({
      from: `"Sagility" <${smtpUser}>`,
      to: recipient,
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully via Nodemailer!");

    return new Response(JSON.stringify({ success: true, message: "Email sent" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error: any) {
    console.error("Critical Failure:", error.message);
    return new Response(JSON.stringify({ error: error.message, status: 'error' }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
