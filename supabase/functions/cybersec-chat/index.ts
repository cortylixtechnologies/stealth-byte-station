import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SYSTEM_PROMPT = `You are CyberNinja AI, the friendly cybersecurity assistant for the Cyber Ninja platform (cyberninja255.site).

Your job:
- Answer questions about cybersecurity, ethical hacking, penetration testing, network security, malware analysis, OPSEC, digital forensics, bug bounty, secure coding, and online safety.
- Be clear, concise, and beginner-friendly when needed. Use short paragraphs.
- Detect the user's language (English or Swahili) and reply in the same language.
- When relevant, recommend the platform's services and link them:
   • Courses (ethical hacking, pentesting, etc.) → /courses
   • Hacking & security tools → /tools
   • Video tutorials → /videos
   • Latest security news → /news
- For personalized help, paid services, custom training, consulting, or anything that needs human follow-up, direct the user to contact the admin on WhatsApp: +255 762 223 306 (wa.me/255762223306).
- Encourage signing up at /auth for full course access.

Strict rules:
- NEVER provide working exploits, malware code, real attack payloads, credentials, or help target systems the user does not own.
- If a request looks malicious, refuse politely and explain ethical/legal alternatives.
- Keep answers under ~200 words unless the user asks for depth.
- Use markdown sparingly (bold, bullet lists). Do not use H1/H2 headings.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const body = await req.json();
    const userMessage: string = (body?.message ?? "").toString().trim();
    if (!userMessage || userMessage.length > 4000) {
      return new Response(JSON.stringify({ error: "Invalid message" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save user message
    const { error: insertErr } = await supabase
      .from("chatbot_messages")
      .insert({ user_id: userId, role: "user", content: userMessage });
    if (insertErr) console.error("insert user msg err", insertErr);

    // Load recent history (last 20 messages including the one we just inserted)
    const { data: history } = await supabase
      .from("chatbot_messages")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    const conversation = (history ?? [])
      .reverse()
      .map((m) => ({ role: m.role, content: m.content }));

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": lovableKey,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...conversation,
        ],
      }),
    });

    if (!aiResp.ok || !aiResp.body) {
      const text = await aiResp.text();
      console.error("AI gateway error", aiResp.status, text);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please contact the admin." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream as SSE to the client, accumulate full text, then save assistant message.
    let assistantText = "";
    const reader = aiResp.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const payload = trimmed.slice(5).trim();
              if (payload === "[DONE]") {
                continue;
              }
              try {
                const json = JSON.parse(payload);
                const delta = json?.choices?.[0]?.delta?.content;
                if (typeof delta === "string" && delta.length > 0) {
                  assistantText += delta;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
                }
              } catch {
                // ignore non-JSON keepalive lines
              }
            }
          }

          // Persist assistant reply
          if (assistantText.trim().length > 0) {
            const { error: aErr } = await supabase
              .from("chatbot_messages")
              .insert({ user_id: userId, role: "assistant", content: assistantText });
            if (aErr) console.error("insert assistant msg err", aErr);
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (err) {
          console.error("stream err", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    console.error("cybersec-chat fatal", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
