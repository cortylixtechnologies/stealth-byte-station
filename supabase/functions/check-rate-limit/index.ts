import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins - restrict to your frontend domains only
const ALLOWED_ORIGINS = [
  "https://stealth-byte-station.lovable.app",
  "https://cyberninja255.vercel.app",
  "http://localhost:5173", // Local development
  "http://localhost:3000",
];

// Security headers to hide tech stack and prevent common attacks
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  
  // Only allow whitelisted origins
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Max-Age": "86400",
    ...securityHeaders,
  };
}

// Input sanitization function
function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== "string") return null;
  
  // Trim and lowercase
  const sanitized = email.trim().toLowerCase();
  
  // Basic email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(sanitized)) return null;
  
  // Length limit to prevent abuse
  if (sanitized.length > 255) return null;
  
  // Prevent injection attacks - reject suspicious patterns
  const injectionPatterns = [
    /[<>'"`;\\]/,  // HTML/SQL injection chars
    /(\$\{|\$\()/,  // Template injection
    /\b(union|select|insert|update|delete|drop|exec|execute)\b/i, // SQL keywords
  ];
  
  for (const pattern of injectionPatterns) {
    if (pattern.test(sanitized)) return null;
  }
  
  return sanitized;
}

function sanitizeAction(action: string): "check" | "record" | null {
  if (action === "check" || action === "record") return action;
  return null;
}

interface RateLimitRequest {
  email: string;
  action: "check" | "record";
  success?: boolean;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  // Only allow POST method
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and validate request body
    let body: RateLimitRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(body.email);
    if (!sanitizedEmail) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sanitizedAction = sanitizeAction(body.action);
    if (!sanitizedAction) {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const success = typeof body.success === "boolean" ? body.success : false;

    // Get client IP from headers - check multiple sources for accuracy
    const ipAddress = 
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("true-client-ip") ||
      req.headers.get("x-client-ip") ||
      "unknown";
    
    // Get additional client info for better tracking
    const userAgent = req.headers.get("user-agent")?.substring(0, 500) || "unknown";
    const country = req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || "unknown";

    if (sanitizedAction === "check") {
      // Check rate limit
      const { data, error } = await supabase.rpc("check_rate_limit", {
        _email: sanitizedEmail,
        _ip_address: ipAddress,
        _max_attempts: 5,
        _window_minutes: 15,
      });

      if (error) {
        console.error("Rate limit check error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to check rate limit" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = data?.[0] || { is_blocked: false, attempts_remaining: 5, blocked_until: null };
      
      console.log(`Rate limit check for ${sanitizedEmail}: blocked=${result.is_blocked}, remaining=${result.attempts_remaining}`);

      return new Response(
        JSON.stringify({
          isBlocked: result.is_blocked,
          attemptsRemaining: result.attempts_remaining,
          blockedUntil: result.blocked_until,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (sanitizedAction === "record") {
      // Record login attempt
      const { error } = await supabase.rpc("record_login_attempt", {
        _email: sanitizedEmail,
        _ip_address: ipAddress,
        _success: success,
      });

      if (error) {
        console.error("Record attempt error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to record attempt" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Log to security_logs with enhanced metadata
      const eventType = success ? "login_success" : "login_failed";
      const eventDescription = success 
        ? `Successful login for email: ${sanitizedEmail}`
        : `Failed login attempt for email: ${sanitizedEmail}`;
      
      await supabase.rpc("log_security_event", {
        _user_id: null,
        _event_type: eventType,
        _event_description: eventDescription,
        _ip_address: ipAddress,
        _user_agent: userAgent,
        _metadata: { 
          email: sanitizedEmail,
          country: country,
          timestamp: new Date().toISOString(),
        },
      });

      console.log(`Recorded ${success ? "successful" : "failed"} login attempt for ${sanitizedEmail}`);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Rate limit function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
