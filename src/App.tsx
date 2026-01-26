import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Tools from "./pages/Tools";
import Videos from "./pages/Videos";
import News from "./pages/News";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Dashboard from "./pages/Dashboard";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

// ================== CYBER NINJA TERMINAL ==================
const CyberNinjaTerminal: React.FC = () => {
  const bootMessages = [
    "Initializing digital shadows...",
    "Loading cyber modules...",
    "Establishing secure shell...",
    "Bypassing firewall...",
    "System online.",
  ];

  const [lines, setLines] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [bootIndex, setBootIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [booting, setBooting] = useState(true);

  // -------- BOOT SEQUENCE (INFINITE) --------
  useEffect(() => {
    if (!booting) return;

    const speed = 25 + Math.random() * 75;

    const timeout = setTimeout(() => {
      setLines((prev) => {
        const updated = [...prev];
        if (!updated[bootIndex]) updated[bootIndex] = "";
        updated[bootIndex] += bootMessages[bootIndex][charIndex];
        return updated;
      });

      if (charIndex + 1 === bootMessages[bootIndex].length) {
        if (bootIndex + 1 === bootMessages.length) {
          setTimeout(() => setBooting(false), 500);
        } else {
          setBootIndex((i) => i + 1);
          setCharIndex(0);
        }
      } else {
        setCharIndex((c) => c + 1);
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [bootIndex, charIndex, booting]);

  // -------- COMMAND HANDLER --------
  const runCommand = (cmd: string) => {
    const command = cmd.toLowerCase().trim();
    let output: string[] = [];

    switch (command) {
      case "help":
        output = [
          "Available commands:",
          "help        show commands",
          "whoami      identify user",
          "status      system status",
          "connect     establish link",
          "clear       clear terminal",
          "exit        reboot system",
        ];
        break;

      case "whoami":
        output = ["CYBER_NINJA // root access granted"];
        break;

      case "status":
        output = [
          "CPU  ████████░░ 81%",
          "RAM  ██████░░░░ 63%",
          "NET  ENCRYPTED",
        ];
        break;

      case "connect":
        output = [
          "Resolving node...",
          "Injecting payload...",
          "Connection established ✔",
        ];
        break;

      case "clear":
        setLines([]);
        return;

      case "exit":
        setLines([]);
        setBootIndex(0);
        setCharIndex(0);
        setBooting(true);
        return;

      default:
        output = [`Command not found: ${command}`];
    }

    setLines((prev) => [...prev, `> ${cmd}`, ...output]);
  };

  // -------- INPUT --------
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      runCommand(input);
      setInput("");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#000",
        color: "#00ff00",
        fontFamily: "monospace",
        padding: "2rem",
        overflow: "hidden",
        zIndex: 9999,
        textShadow: "0 0 5px #00ff00, 0 0 12px #00ff00",
      }}
    >
      {/* CRT Scanlines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(to bottom, rgba(0,255,0,0.04), rgba(0,255,0,0.04) 1px, transparent 2px, transparent 4px)",
        }}
      />

      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}

      {!booting && (
        <div>
          <span style={{ color: "#00ffaa" }}>{"> "}</span>
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#00ff00",
              fontFamily: "monospace",
              width: "80%",
            }}
          />
          <span style={{ animation: "blink 1s infinite" }}>█</span>
        </div>
      )}

      <style>
        {`
          @keyframes blink {
            0%, 50%, 100% { opacity: 1; }
            25%, 75% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};
// =========================================================

const queryClient = new QueryClient();
const SHOW_CYBER_NINJA_TERMINAL = false;

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      {SHOW_CYBER_NINJA_TERMINAL ? (
        <CyberNinjaTerminal />
      ) : (
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/news" element={<News />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      )}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
