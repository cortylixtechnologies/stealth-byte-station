import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get tools without Swahili descriptions
    const { data: tools, error } = await supabase
      .from("tools")
      .select("id, name, description")
      .is("description_sw", null)
      .not("description", "is", null);

    if (error) throw error;
    if (!tools || tools.length === 0) {
      return new Response(JSON.stringify({ message: "No tools to translate", count: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let translated = 0;

    for (const tool of tools) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lovableApiKey}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              {
                role: "system",
                content: "You are a translator. Translate the following tool description from English to Swahili. Keep technical terms, product names, emojis, and formatting intact. Return ONLY the translated text, nothing else.",
              },
              {
                role: "user",
                content: tool.description,
              },
            ],
          }),
        });

        const result = await response.json();
        const translatedText = result.choices?.[0]?.message?.content;

        if (translatedText) {
          await supabase
            .from("tools")
            .update({ description_sw: translatedText })
            .eq("id", tool.id);
          translated++;
        }
      } catch (e) {
        console.error(`Failed to translate tool ${tool.name}:`, e);
      }
    }

    return new Response(
      JSON.stringify({ message: `Translated ${translated} of ${tools.length} tools`, count: translated }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
