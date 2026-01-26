import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RateLimitRequest {
  email: string;
  action: "check" | "record";
  success?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, action, success = false }: RateLimitRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get client IP from headers - check multiple sources for accuracy
    // Priority: CF-Connecting-IP (Cloudflare) > X-Real-IP > X-Forwarded-For > connection remote addr
    const ipAddress = 
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("true-client-ip") ||
      req.headers.get("x-client-ip") ||
      "unknown";
    
    // Get additional client info for better tracking
    const userAgent = req.headers.get("user-agent") || "unknown";
    const country = req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || "unknown";

    if (action === "check") {
      // Check rate limit
      const { data, error } = await supabase.rpc("check_rate_limit", {
        _email: email.toLowerCase(),
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
      
      console.log(`Rate limit check for ${email}: blocked=${result.is_blocked}, remaining=${result.attempts_remaining}`);

      return new Response(
        JSON.stringify({
          isBlocked: result.is_blocked,
          attemptsRemaining: result.attempts_remaining,
          blockedUntil: result.blocked_until,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (action === "record") {
      // Record login attempt
      const { error } = await supabase.rpc("record_login_attempt", {
        _email: email.toLowerCase(),
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

      // Log to security_logs for failed attempts with enhanced metadata
      if (!success) {
        await supabase.rpc("log_security_event", {
          _user_id: null,
          _event_type: "login_failed",
          _event_description: `Failed login attempt for email: ${email}`,
          _ip_address: ipAddress,
          _user_agent: userAgent,
          _metadata: { 
            email: email.toLowerCase(),
            country: country,
            timestamp: new Date().toISOString(),
          },
        });
      } else {
        // Also log successful logins
        await supabase.rpc("log_security_event", {
          _user_id: null,
          _event_type: "login_success",
          _event_description: `Successful login for email: ${email}`,
          _ip_address: ipAddress,
          _user_agent: userAgent,
          _metadata: { 
            email: email.toLowerCase(),
            country: country,
            timestamp: new Date().toISOString(),
          },
        });
      }

      console.log(`Recorded ${success ? "successful" : "failed"} login attempt for ${email}`);

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
