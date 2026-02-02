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

// Strict UUID validation
function isValidUUID(str: string): boolean {
  if (!str || typeof str !== "string") return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight requests
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

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Validate token format (basic check before API call)
    if (token.length < 100 || token.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication token format" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify JWT and get claims
    const { data: claimsData, error: claimsError } = await supabaseAdmin.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("JWT verification failed:", claimsError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const callerId = claimsData.claims.sub;
    if (!callerId || !isValidUUID(callerId)) {
      return new Response(
        JSON.stringify({ error: "Invalid user identity" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if caller is admin using the has_role function (more secure)
    const { data: hasAdminRole, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: callerId,
      _role: "admin",
    });

    if (roleError || !hasAdminRole) {
      console.warn(`Non-admin user ${callerId} attempted to delete a user`);
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    let body: { userId?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { userId } = body;

    // Validate UUID format strictly
    if (!userId || !isValidUUID(userId)) {
      return new Response(
        JSON.stringify({ error: "Invalid user ID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent self-deletion
    if (userId === callerId) {
      return new Response(
        JSON.stringify({ error: "Cannot delete your own account" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if target user is also an admin (prevent deleting other admins)
    const { data: targetIsAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (targetIsAdmin) {
      console.warn(`Admin ${callerId} attempted to delete another admin ${userId}`);
      return new Response(
        JSON.stringify({ error: "Cannot delete admin accounts" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete related data first (in case no cascade is set up)
    const deleteOperations = await Promise.allSettled([
      supabaseAdmin.from("user_roles").delete().eq("user_id", userId),
      supabaseAdmin.from("profiles").delete().eq("user_id", userId),
      supabaseAdmin.from("course_enrollments").delete().eq("user_id", userId),
      supabaseAdmin.from("lesson_progress").delete().eq("user_id", userId),
      supabaseAdmin.from("certificates").delete().eq("user_id", userId),
    ]);

    // Log any deletion failures (non-critical)
    deleteOperations.forEach((result, index) => {
      if (result.status === "rejected") {
        console.warn(`Related data deletion ${index} failed:`, result.reason);
      }
    });

    // Delete the auth user (this is the critical part that requires service role)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Error deleting auth user:", deleteError);
      return new Response(
        JSON.stringify({ error: "Failed to delete user from auth system" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get caller info for audit log
    const ipAddress = 
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const userAgent = req.headers.get("user-agent")?.substring(0, 500) || "unknown";

    // Log the deletion event
    await supabaseAdmin.from("security_logs").insert({
      user_id: callerId,
      event_type: "user_deletion",
      event_description: `Admin deleted user account: ${userId}`,
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: { 
        deleted_user_id: userId,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`Admin ${callerId} successfully deleted user ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: "User deleted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in delete-user function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
