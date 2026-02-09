import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface LoadingMessage {
  text: string;
  duration: number;
  type?: "normal" | "success" | "warning" | "hack";
}

const loadingMessages: LoadingMessage[] = [
  { text: "root@cyberninja:~$ ./init_payload.sh", duration: 500, type: "hack" },
  { text: "[ KERNEL ] Loading exploit modules v4.2.0...", duration: 600 },
  { text: "[ CRYPTO ] Generating RSA-4096 keypair...", duration: 700 },
  { text: "[ TUNNEL ] Establishing TOR circuit... 3 relays found", duration: 800 },
  { text: "[ SPOOF ] MAC address randomized: 4A:F3:9C:1B:7E:D2", duration: 500, type: "warning" },
  { text: "[ NMAP  ] Scanning target... 1337 ports open", duration: 900 },
  { text: "[ CRACK ] Brute-forcing access... ██████████ 100%", duration: 700, type: "hack" },
  { text: "[ SHELL ] Reverse shell established on port 4444", duration: 600 },
  { text: "[ PRIV  ] Escalating privileges... root obtained!", duration: 500, type: "warning" },
  { text: "[ WIPE  ] Clearing logs... traces removed", duration: 400 },
  { text: "[ SYS   ] All systems compromised.", duration: 500, type: "success" },
  { text: "[ NINJA ] Access GRANTED — Welcome back, Operator.", duration: 700, type: "success" },
];

const matrixChars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";

const generateIP = () =>
  `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

const generateHex = (len: number) =>
  Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join("");

interface LoadingScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const columns = Math.floor(canvas.width / 14);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "hsl(142, 70%, 45%)";
      ctx.font = "12px monospace";

      for (let i = 0; i < drops.length; i++) {
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        ctx.fillText(char, i * 14, drops[i] * 14);
        if (drops[i] * 14 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 opacity-20" />;
};

const LoadingScreen = ({ onComplete, minDuration = 5000 }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<LoadingMessage[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [hackData, setHackData] = useState({ ip: generateIP(), hex: generateHex(16) });

  // Cycle random data
  useEffect(() => {
    const interval = setInterval(() => {
      setHackData({ ip: generateIP(), hex: generateHex(16) });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    let messageTimeout: NodeJS.Timeout;

    const showNextMessage = (index: number) => {
      if (index >= loadingMessages.length) {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDuration - elapsed);
        setTimeout(() => {
          setIsComplete(true);
          setTimeout(onComplete, 600);
        }, remaining);
        return;
      }

      const message = loadingMessages[index];
      setDisplayedMessages((prev) => [...prev.slice(-7), message]);
      setProgress(((index + 1) / loadingMessages.length) * 100);

      messageTimeout = setTimeout(() => {
        showNextMessage(index + 1);
      }, message.duration);
    };

    showNextMessage(0);
    return () => { if (messageTimeout) clearTimeout(messageTimeout); };
  }, [onComplete, minDuration]);

  const getMessageColor = (msg: LoadingMessage) => {
    if (msg.type === "success") return "text-secondary neon-text-green";
    if (msg.type === "warning") return "text-yellow-400";
    if (msg.type === "hack") return "text-accent";
    return "text-primary";
  };

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
          <MatrixRain />

          {/* Scanlines */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                "repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,255,65,0.03) 2px, rgba(0,255,65,0.03) 4px)",
            }}
          />

          {/* Glowing orbs */}
          <div className="absolute top-1/3 left-1/6 w-64 h-64 bg-primary/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/6 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse" />

          <div className="relative z-20 w-full max-w-2xl px-6">
            {/* Skull/Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="flex items-center justify-center gap-3 mb-8"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(0,255,65,0.4)",
                    "0 0 60px rgba(0,255,65,0.8)",
                    "0 0 20px rgba(0,255,65,0.4)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-16 h-16 bg-black border-2 border-secondary rounded-lg flex items-center justify-center"
              >
                <span className="text-3xl font-mono font-bold text-secondary">💀</span>
              </motion.div>
              <div className="font-mono">
                <h1 className="text-3xl font-bold text-secondary" style={{ textShadow: "0 0 20px rgba(0,255,65,0.6)" }}>
                  CYBERNINJA
                </h1>
                <p className="text-xs text-secondary/60 tracking-widest">OFFENSIVE SECURITY OPS</p>
              </div>
            </motion.div>

            {/* Floating hex data */}
            <div className="flex justify-between text-[10px] font-mono text-primary/30 mb-2 px-1">
              <span>TARGET: {hackData.ip}</span>
              <span>0x{hackData.hex}</span>
            </div>

            {/* Terminal Window */}
            <div className="border border-secondary/30 rounded-lg overflow-hidden bg-black/80 backdrop-blur-sm shadow-[0_0_30px_rgba(0,255,65,0.1)]">
              {/* Terminal Header */}
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary/5 border-b border-secondary/20">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-secondary/80" />
                <span className="ml-2 text-xs text-secondary/50 font-mono">
                  root@cyberninja:~/exploit$
                </span>
                <span className="ml-auto text-[10px] text-secondary/30 font-mono">
                  PID: {Math.floor(Math.random() * 9999)}
                </span>
              </div>

              {/* Terminal Content */}
              <div className="p-4 font-mono text-sm min-h-[220px] space-y-1">
                {displayedMessages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`py-0.5 ${getMessageColor(msg)}`}
                  >
                    {msg.text}
                  </motion.div>
                ))}

                {/* Blinking cursor */}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                  className="inline-block w-2.5 h-4 bg-secondary ml-1"
                />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-secondary/50">
                <span>Payload delivery...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5 bg-secondary/10" />
            </div>

            {/* Bottom status */}
            <div className="mt-4 flex justify-center gap-6 text-[10px] font-mono">
              <div className="flex items-center gap-1.5">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-secondary"
                />
                <span className="text-secondary/50">AES-256-GCM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-yellow-400"
                />
                <span className="text-secondary/50">TOR: 3 HOPS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-accent"
                />
                <span className="text-secondary/50">STEALTH: ON</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
