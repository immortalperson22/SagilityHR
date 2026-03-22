import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { uploadId, storagePath, filename } = await req.json();

    console.log(`Approving document: ${filename}`);
    console.log(`Upload ID: ${uploadId}`);
    console.log(`Storage path: ${storagePath}`);
    
    // Email sending would go here with Resend API
    // For now, we log the approval
    console.log(`Document ${filename} approved - would email to support@sagility.com`);

    return new Response(
      JSON.stringify({ success: true, message: "Document approved" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
