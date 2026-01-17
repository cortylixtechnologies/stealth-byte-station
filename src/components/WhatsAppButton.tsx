import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
}

const WhatsAppButton = ({
  phoneNumber,
  message = "Hello! I'm interested in your services.",
}: WhatsAppButtonProps) => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 p-4 bg-[#25D366] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <MessageCircle className="w-6 h-6 text-white" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-card border border-border px-3 py-2 rounded-lg text-sm font-mono text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Chat with us!
      </span>
    </motion.a>
  );
};

export default WhatsAppButton;