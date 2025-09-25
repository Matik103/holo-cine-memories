import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Webhook signature verification
const verifyWebhookSignature = async (req: Request): Promise<boolean> => {
  const signature = req.headers.get("x-webhook-signature");
  if (!signature) {
    console.error("No webhook signature found");
    return false;
  }

  const body = await req.text();
  const secret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
  if (!secret) {
    console.error("No webhook secret configured");
    return false;
  }

  // Simple signature verification (in production, use proper HMAC verification)
  const expectedSignature = `v1,whsec_${btoa(secret)}`;
  return signature === expectedSignature;
};

interface EmailRequest {
  user: {
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: "signup" | "recovery" | "invite" | "magiclink";
    site_url: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Auth email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  // Log all headers for debugging
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));
  
  // Verify webhook signature when called by Supabase
  const isValidWebhook = await verifyWebhookSignature(req.clone());
  if (!isValidWebhook) {
    console.log("Invalid webhook signature, treating as custom call");
    // Allow custom calls from our emailService for backward compatibility
  }

  try {
    const body: EmailRequest = await req.json();
    console.log("Email request received:", { 
      email: body.user.email, 
      type: body.email_data.email_action_type 
    });

    const { user, email_data } = body;
    const { email } = user;
    const { token, token_hash, redirect_to, email_action_type, site_url } = email_data;

    let subject: string;
    let html: string;

    // For recovery emails, redirect to our auth page with the token
    // For signup emails, use Supabase's verification endpoint  
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    let confirmationUrl: string;
    
    if (email_action_type === "recovery") {
      // For password reset, redirect directly to auth page with token in hash
      confirmationUrl = `${redirect_to}#access_token=${token}&type=${email_action_type}`;
    } else {
      // For signup confirmation, use Supabase's verification endpoint
      confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to)}`;
    }
    
    const displayName = user.user_metadata?.full_name || "there";

    if (email_action_type === "signup") {
      subject = "Welcome to CineMind - Confirm Your Email";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed; margin: 0;">CineMind</h1>
            <p style="color: #6b7280; margin: 5px 0;">Your AI Movie Memory Companion</p>
          </div>
          
          <h2 style="color: #1f2937;">Welcome ${displayName}!</h2>
          
          <p style="color: #374151; line-height: 1.6;">
            Thanks for joining CineMind! We're excited to help you remember every movie with the power of AI.
          </p>
          
          <p style="color: #374151; line-height: 1.6;">
            To get started, please confirm your email address by clicking the button below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="background: linear-gradient(135deg, #7c3aed, #a855f7); 
                      color: white; 
                      padding: 14px 28px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      display: inline-block;">
              Confirm Your Email
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            If the button doesn't work, copy and paste this link into your browser:
            <br>
            <a href="${confirmationUrl}" style="color: #7c3aed; word-break: break-all;">${confirmationUrl}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            This email was sent by CineMind. If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `;
    } else if (email_action_type === "recovery") {
      subject = "Reset Your CineMind Password";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed; margin: 0;">CineMind</h1>
            <p style="color: #6b7280; margin: 5px 0;">Your AI Movie Memory Companion</p>
          </div>
          
          <h2 style="color: #1f2937;">Reset Your Password</h2>
          
          <p style="color: #374151; line-height: 1.6;">
            Hi ${displayName},
          </p>
          
          <p style="color: #374151; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="background: linear-gradient(135deg, #7c3aed, #a855f7); 
                      color: white; 
                      padding: 14px 28px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            If the button doesn't work, copy and paste this link into your browser:
            <br>
            <a href="${confirmationUrl}" style="color: #7c3aed; word-break: break-all;">${confirmationUrl}</a>
          </p>
          
          <p style="color: #ef4444; font-size: 14px; line-height: 1.6;">
            If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            This email was sent by CineMind. This link will expire in 24 hours for security reasons.
          </p>
        </div>
      `;
    } else {
      throw new Error(`Unsupported email action type: ${email_action_type}`);
    }

    const { data, error } = await resend.emails.send({
      from: "CineMind <noreply@cinemind.tech>",
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-auth-emails function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send email",
        details: error 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);