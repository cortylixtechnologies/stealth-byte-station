import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Mic, MicOff, Trash2, MessageCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Web Speech API types
type SpeechRecognitionInstance = {
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
  lang: string;
  interimResults: boolean;
  continuous: boolean;
};

const getSpeechRecognition = (): (new () => SpeechRecognitionInstance) | null => {
  if (typeof window === "undefined") return null;
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  );
};

const ChatbotWidget = () => {
  const { user, session } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [listening, setListening] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const speechSupported = !!getSpeechRecognition();

  // Load history when opening
  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    (async () => {
      setLoadingHistory(true);
      const { data, error } = await supabase
        .from("chatbot_messages")
        .select("id, role, content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(50);
      if (!cancelled) {
        if (error) {
          console.error(error);
        } else {
          setMessages(
            (data ?? []).map((m) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
            }))
          );
        }
        setLoadingHistory(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming || !session) return;

    setInput("");
    const userMsg: ChatMessage = {
      id: `tmp-${Date.now()}`,
      role: "user",
      content: text,
    };
    const assistantId = `tmp-a-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setStreaming(true);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cybersec-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message: text }),
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || `Request failed (${resp.status})`);
      }
      if (!resp.body) throw new Error("No response stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const delta: string | undefined = json.delta;
            if (delta) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + delta }
                    : m
                )
              );
            }
          } catch {
            /* ignore */
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `⚠ ${message}` }
            : m
        )
      );
    } finally {
      setStreaming(false);
    }
  }, [input, streaming, session]);

  const toggleListening = () => {
    const SR = getSpeechRecognition();
    if (!SR) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      let transcript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setInput(transcript);
    };
    rec.onerror = (e: any) => {
      console.error("speech err", e);
      toast.error("Couldn't capture audio. Try again.");
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch (e) {
      console.error(e);
    }
  };

  const clearChat = async () => {
    if (!user) return;
    if (!confirm("Clear all chat history?")) return;
    const { error } = await supabase
      .from("chatbot_messages")
      .delete()
      .eq("user_id", user.id);
    if (error) {
      toast.error("Failed to clear chat.");
      return;
    }
    setMessages([]);
    toast.success("Chat cleared.");
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating launcher (bottom-left to avoid WhatsApp button on bottom-right) */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 left-6 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-neon-cyan hover:shadow-xl transition-all duration-300 group"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI assistant"
      >
        {open ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        {!open && (
          <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-card border border-border px-3 py-2 rounded-lg text-sm font-mono text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Ask CyberNinja AI
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-6 z-50 w-[calc(100vw-3rem)] sm:w-[400px] h-[min(600px,80vh)] bg-card border border-primary/30 rounded-xl shadow-neon-cyan flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-primary/30">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/20 text-primary">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-mono text-sm font-bold text-foreground">
                    CyberNinja AI
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {streaming ? "thinking..." : "online"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {user && messages.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearChat}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    aria-label="Clear chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 p-0"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* WhatsApp quick action */}
            <a
              href="https://wa.me/255762223306"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#25D366]/10 border-b border-[#25D366]/30 hover:bg-[#25D366]/20 transition-colors text-xs font-mono text-[#25D366]"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Need personal help? Chat on WhatsApp →
            </a>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {!user ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-4">
                  <Bot className="w-12 h-12 text-primary" />
                  <p className="font-mono text-sm text-foreground">
                    Sign in to chat with CyberNinja AI
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your conversation history is saved per account.
                  </p>
                  <Link to="/auth">
                    <Button size="sm" className="font-mono mt-2">
                      Sign In
                    </Button>
                  </Link>
                </div>
              ) : loadingHistory ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground font-mono px-2 py-8">
                  <Bot className="w-10 h-10 text-primary mx-auto mb-3" />
                  <p className="text-foreground mb-2">Hey Ninja 👋</p>
                  <p className="text-xs">
                    Ask me anything about cybersecurity — courses, tools, ethical
                    hacking, network security, or how to get started.
                  </p>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words font-mono ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground border border-border"
                      }`}
                    >
                      {m.content || (
                        <span className="inline-flex gap-1">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.15s]" />
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.3s]" />
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Composer */}
            {user && (
              <div className="border-t border-border p-2 bg-background/50">
                <div className="flex items-end gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKey}
                    placeholder={
                      listening ? "Listening..." : "Ask a cybersec question..."
                    }
                    rows={1}
                    disabled={streaming}
                    className="flex-1 resize-none bg-background border border-border rounded-md px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary max-h-32"
                  />
                  {speechSupported && (
                    <Button
                      type="button"
                      size="icon"
                      variant={listening ? "default" : "outline"}
                      onClick={toggleListening}
                      disabled={streaming}
                      className={`h-9 w-9 shrink-0 ${
                        listening ? "bg-destructive hover:bg-destructive/90 animate-pulse" : ""
                      }`}
                      aria-label={listening ? "Stop voice input" : "Start voice input"}
                    >
                      {listening ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="icon"
                    onClick={sendMessage}
                    disabled={!input.trim() || streaming}
                    className="h-9 w-9 shrink-0"
                    aria-label="Send"
                  >
                    {streaming ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;
