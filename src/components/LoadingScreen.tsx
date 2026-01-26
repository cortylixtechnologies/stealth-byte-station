import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface LoadingMessage {
  text: string;
  duration: number;
}

const loadingMessages: LoadingMessage[] = [
  { text: "[ SYSTEM ] Initializing kernel modules...", duration: 600 },
  { text: "[ SECURITY ] Establishing encrypted connection...", duration: 800 },
  { text: "[ NETWORK ] Routing through secure proxy...", duration: 700 },
  { text: "[ AUTH ] Verifying digital signature...", duration: 500 },
  { text: "[ SERVER ] Communicating with Cyber HQ...", duration: 900 },
  { text: "[ FIREWALL ] Bypassing security protocols...", duration: 600 },
  { text: "[ DATABASE ] Syncing encrypted data nodes...", duration: 700 },
  { text: "[ TERMINAL ] Loading interface modules...", duration: 500 },
  { text: "[ STATUS ] All systems operational...", duration: 400 },
  { text: "[ ACCESS ] GRANTED - Welcome, Ninja.", duration: 600 },
];

interface LoadingScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

const LoadingScreen = ({ onComplete, minDuration = 4000 }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    let messageTimeout: NodeJS.Timeout;

    const showNextMessage = (index: number) => {
      if (index >= loadingMessages.length) {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDuration - elapsed);
        
        setTimeout(() => {
          setIsComplete(true);
          setTimeout(onComplete, 500);
        }, remaining);
        return;
      }

      const message = loadingMessages[index];
      setDisplayedMessages((prev) => [...prev.slice(-6), message.text]);
      setCurrentMessageIndex(index);
      setProgress(((index + 1) / loadingMessages.length) * 100);

      messageTimeout = setTimeout(() => {
        showNextMessage(index + 1);
      }, message.duration);
    };

    // Start the loading sequence
    showNextMessage(0);

    return () => {
      if (messageTimeout) clearTimeout(messageTimeout);
    };
  }, [onComplete, minDuration]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center overflow-hidden"
        >
          {/* CRT Scanlines Effect */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "repeating-linear-gradient(to bottom, transparent, transparent 2px, hsl(var(--primary) / 0.03) 2px, hsl(var(--primary) / 0.03) 4px)",
            }}
          />

          {/* Matrix Grid Background */}
          <div className="absolute inset-0 matrix-bg opacity-50" />

          {/* Glowing orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />

          <div className="relative z-10 w-full max-w-2xl px-6">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center gap-3 mb-12"
            >
              <div className="relative">
                <motion.div
                  animate={{ 
                    boxShadow: [
                      "0 0 20px hsl(var(--primary) / 0.5)",
                      "0 0 40px hsl(var(--primary) / 0.8)",
                      "0 0 20px hsl(var(--primary) / 0.5)",
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/50"
                >
                  <span className="text-3xl font-mono font-bold text-primary neon-text">CN</span>
                </motion.div>
              </div>
              <div className="font-mono">
                <h1 className="text-3xl font-bold text-primary neon-text">CYBERNINJA</h1>
                <p className="text-sm text-muted-foreground">Security Operations Center</p>
              </div>
            </motion.div>

            {/* Terminal Window */}
            <div className="cyber-card border border-border rounded-lg overflow-hidden">
              {/* Terminal Header */}
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-secondary" />
                <span className="ml-2 text-xs text-muted-foreground font-mono">
                  cyberninja@secure-terminal ~ 
                </span>
              </div>

              {/* Terminal Content */}
              <div className="p-4 font-mono text-sm min-h-[200px] bg-background/50">
                {displayedMessages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`py-1 ${
                      message.includes("GRANTED")
                        ? "text-secondary neon-text-green"
                        : message.includes("SECURITY")
                        ? "text-accent"
                        : message.includes("ERROR")
                        ? "text-destructive"
                        : "text-primary"
                    }`}
                  >
                    {message}
                  </motion.div>
                ))}
                
                {/* Blinking cursor */}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="inline-block w-2 h-4 bg-primary ml-1"
                />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                <span>Loading system modules...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress 
                value={progress} 
                className="h-2 bg-muted"
              />
            </div>

            {/* Status indicators */}
            <div className="mt-6 flex justify-center gap-6 text-xs font-mono">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-secondary"
                />
                <span className="text-muted-foreground">ENCRYPTION: AES-256</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-primary"
                />
                <span className="text-muted-foreground">CONNECTION: SECURE</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-accent"
                />
                <span className="text-muted-foreground">VPN: ACTIVE</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
