
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const body = await req.json();
    const { email, template, data } = body;
    
    if (!email || !template) {
      return new Response(
        JSON.stringify({ error: "Email and template are required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Handle different email templates
    let subject = "";
    let htmlContent = "";
    
    if (template === "confirm-signup") {
      subject = "Welcome to Magic Events - Confirm Your Email";
      htmlContent = generateConfirmationEmail(data);
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid template" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // In a real implementation, you would send the email using your provider
    // For demonstration, we'll just return the HTML content
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email would be sent in production",
        preview: htmlContent
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
    
  } catch (error) {
    console.error("Error in custom-email function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

function generateConfirmationEmail(data: any): string {
  const { confirmation_url, name } = data;
  const userName = name || "Magic Fan";
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirm Your Email</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-top: 20px;
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
          margin-bottom: 20px;
        }
        .logo {
          width: 120px;
          height: auto;
        }
        .content {
          padding: 20px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #7C4DFF;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          margin: 20px 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        .button:hover {
          background-color: #6C3BEE;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #999;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        .magic-illustration {
          text-align: center;
          margin-bottom: 20px;
        }
        .magic-illustration img {
          width: 180px;
          height: auto;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: #7C4DFF; margin: 0;">Magic Events</h1>
          <p style="color: #666; margin-top: 5px;">Your Gathering Place for Magic Events</p>
        </div>
        
        <div class="content">
          <div class="magic-illustration">
            <img src="https://i.imgur.com/kUb0nKM.png" alt="Magic Illustration">
          </div>
          
          <h2>Welcome, ${userName}! 🎉</h2>
          
          <p>Thanks for joining Magic Events! We're excited to have you be part of our growing community of Magic: The Gathering enthusiasts.</p>
          
          <p>Before you can start exploring events and connecting with other players, we need to verify your email address.</p>
          
          <div style="text-align: center;">
            <a href="${confirmation_url}" class="button">Confirm My Email</a>
          </div>
          
          <p>This link will expire in 24 hours. If you don't confirm your email within that time, you'll need to sign up again.</p>
          
          <p>If you didn't create an account with Magic Events, you can safely ignore this email.</p>
          
          <p>Happy gaming!</p>
          
          <p><strong>The Magic Events Team</strong></p>
        </div>
        
        <div class="footer">
          <p>© 2025 Magic Events. All rights reserved.</p>
          <p>This email was sent to you as part of your registration process.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
