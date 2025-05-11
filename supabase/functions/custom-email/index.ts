
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const SITE_URL = "https://lovable-magic.vercel.app"; // Update with your actual domain

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, email, redirectTo } = await req.json();

    // Get base URL from request or use default
    const host = req.headers.get("origin") || SITE_URL;
    
    // Create beautiful HTML email template
    if (type === "signup") {
      const html = generateSignupEmailHTML(email, redirectTo || `${host}/auth/callback`);
      
      return new Response(
        JSON.stringify({
          html,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else if (type === "reset") {
      const html = generateResetEmailHTML(email, redirectTo || `${host}/auth/callback`);
      
      return new Response(
        JSON.stringify({
          html,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Unsupported email type",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

function generateSignupEmailHTML(email: string, redirectTo: string) {
  // Add the signup token to the URL
  const signUpUrl = new URL(redirectTo);
  signUpUrl.searchParams.append("email", encodeURIComponent(email));
  signUpUrl.searchParams.append("type", "signup");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Welcome to Magic The Gathering Community</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 28px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .content {
          padding: 30px 20px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          text-decoration: none;
          padding: 14px 30px;
          border-radius: 50px;
          font-weight: bold;
          margin: 25px 0;
          text-align: center;
          box-shadow: 0 4px 8px rgba(106, 17, 203, 0.2);
          transition: all 0.3s ease;
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(106, 17, 203, 0.3);
        }
        .footer {
          background-color: #f1f1f1;
          padding: 20px;
          text-align: center;
          color: #777;
          font-size: 14px;
        }
        .magic-card {
          margin: 20px auto;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          width: 220px;
          height: 300px;
          background-image: url('https://media.wizards.com/2019/images/daily/c4rd4r7_20191021_Showcase.jpg');
          background-size: cover;
          background-position: center;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Welcome to Magic: The Gathering Community</h1>
        </div>
        <div class="content">
          <h2>Confirm Your Email</h2>
          <p>Hello Planeswalker,</p>
          <p>Thank you for joining our Magic: The Gathering community! We're excited to have you on board. To complete your registration and access events, deck building tools, and more, please confirm your email address.</p>
          
          <div class="magic-card"></div>
          
          <p>Click the button below to confirm your email address:</p>
          <a href="${signUpUrl}" class="button">Confirm Email Address</a>
          
          <p>If you didn't create this account, you can safely ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Magic: The Gathering Community. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateResetEmailHTML(email: string, redirectTo: string) {
  // Add the signup token to the URL
  const resetUrl = new URL(redirectTo);
  resetUrl.searchParams.append("email", encodeURIComponent(email));
  resetUrl.searchParams.append("type", "recovery");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 28px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .content {
          padding: 30px 20px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          text-decoration: none;
          padding: 14px 30px;
          border-radius: 50px;
          font-weight: bold;
          margin: 25px 0;
          text-align: center;
          box-shadow: 0 4px 8px rgba(106, 17, 203, 0.2);
          transition: all 0.3s ease;
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(106, 17, 203, 0.3);
        }
        .footer {
          background-color: #f1f1f1;
          padding: 20px;
          text-align: center;
          color: #777;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>Hello Planeswalker,</p>
          <p>We received a request to reset your password for the Magic: The Gathering Community. Click the button below to reset your password:</p>
          
          <a href="${resetUrl}" class="button">Reset Password</a>
          
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Magic: The Gathering Community. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
