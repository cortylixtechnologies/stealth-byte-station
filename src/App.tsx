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

// ------------------ CYBER NINJA TERMINAL ------------------
const CyberNinjaTerminal: React.FC = () => {
  const messages = [
    "[CYBER NINJA] Initializing digital shadows...",
    "[CYBER NINJA] Website is under development...",
    "[CYBER NINJA] Stay updated for new cyber missions...",
  ];

  const [displayed, setDisplayed] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    // Restart animation after last message
    if (currentMessageIndex >= messages.length) {
      timeout = setTimeout(() => {
        setDisplayed([]);
        setCurrentMessageIndex(0);
        setCharIndex(0);
      }, 1500); // pause before restarting

      return () => clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      setDisplayed((prev) => {
        const newLines = [...prev];
        if (!newLines[currentMessageIndex]) newLines[currentMessageIndex] = "";
        newLines[currentMessageIndex] +=
          messages[currentMessageIndex][charIndex];
        return newLines;
      });

      if (charIndex + 1 === messages[currentMessageIndex].length) {
        setCurrentMessageIndex((prev) => prev + 1);
        setCharIndex(0);
      } else {
        setCharIndex((prev) => prev + 1);
      }
    }, 50); // typing speed

    return () => clearTimeout(timeout);
  }, [charIndex, currentMessageIndex]);

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
      }}
    >
      {displayed.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
      <span style={{ animation: "blink 1s infinite" }}>█</span>

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
// --------------------------------------------------------

const queryClient = new QueryClient();

// Toggle terminal splash
const SHOW_CYBER_NINJA_TERMINAL = true;

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
