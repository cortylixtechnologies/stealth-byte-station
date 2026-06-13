## AI Cybersecurity Assistant Chatbot

A floating chat widget where logged-in users can ask cybersecurity questions by **typing or speaking**. The AI explains concepts, recommends your services (courses, tools, training), and directs users to WhatsApp for personal consultation.

### What will be built

**1. Floating chat button** (`src/components/ChatbotWidget.tsx`)
- Neon-green button in bottom-left corner (WhatsApp button stays bottom-right).
- Opens an AI Elements–styled chat panel with the Cyber Ninja branding.
- Shows a friendly greeting on first open: "Hey Ninja, I'm your AI security guide. Ask me anything."
- Visible on every page of the site.

**2. Chat panel UI** (built with AI Elements: `conversation`, `message`, `prompt-input`, `shimmer`)
- Markdown-rendered AI replies, streaming token-by-token.
- A **microphone button** in the composer toggles voice input using the browser's free Web Speech API (`webkitSpeechRecognition`). Spoken text fills the input box; user can edit before sending.
- A "Chat on WhatsApp" quick-action button at the top of the panel that opens `wa.me/255762223306`.
- Composer disabled while AI is responding; clear errors for rate limits/credits.

**3. Login gate**
- Since history is stored per user, opening the chat while logged out shows a small prompt: "Sign in to chat with the AI assistant" with a link to `/auth`.

**4. Database table** (`public.chatbot_messages`)
- Columns: `id`, `user_id` (FK auth.users), `role` (`user`/`assistant`), `content` (text), `created_at`.
- RLS: users can only read/insert/delete their own messages. Standard GRANTs to `authenticated` + `service_role`.
- One ongoing conversation per user — messages fetched in order on chat open.

**5. Edge function** (`supabase/functions/cybersec-chat/index.ts`)
- Streams responses using AI SDK + Lovable AI Gateway (`google/gemini-3-flash-preview`).
- System prompt tuned for Cyber Ninja:
  - Acts as a friendly cybersecurity expert.
  - Answers questions on ethical hacking, network security, OPSEC, malware, pentesting basics, etc.
  - When relevant, recommends **your services**: Courses (`/courses`), Tools (`/tools`), Video tutorials (`/videos`), and the WhatsApp contact `+255 762 223 306` for personalized help / paid services.
  - Tells users to contact via WhatsApp for advanced/custom inquiries.
  - Refuses to help with anything illegal/malicious.
  - Responds in the user's language (English or Swahili based on user input).
- Validates JWT, fetches user's prior messages from the DB to include as conversation context, saves user message + assistant reply to DB after stream completes.
- Uses CORS headers.

**6. Client integration**
- `useChat` from `@ai-sdk/react` with `DefaultChatTransport` pointing at the edge function.
- Loads existing messages on open via `supabase.from('chatbot_messages').select(...).eq('user_id', user.id).order('created_at')`.
- "Clear conversation" button in the chat header (deletes user's rows).

### Technical details

- Voice input: native `SpeechRecognition` API (no extra deps). Graceful fallback if unsupported — hides mic button.
- AI Elements packages installed via `bunx ai-elements@latest add conversation message prompt-input shimmer`.
- Streaming via Edge Function → `toUIMessageStreamResponse({ originalMessages, onFinish })`.
- New AI SDK packages: `ai`, `@ai-sdk/react`, `@ai-sdk/openai-compatible`.
- `LOVABLE_API_KEY` already exists in secrets — no user action needed.
- WhatsApp link reuses your existing number (`255762223306`).
- Theme matches the neon-green Cyber Ninja look (`primary`, `secondary`, `accent` tokens).

### What this gives users

- Instant 24/7 answers to cybersec questions, with a clear path to your paid services and WhatsApp for deeper help.
- Hands-free voice input for mobile users on the go.
- Per-user persistent chat history so conversations resume across sessions.
