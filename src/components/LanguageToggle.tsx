import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { Languages } from "lucide-react";

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="relative text-primary hover:text-primary hover:bg-primary/10 font-mono text-xs font-bold"
      title={language === "en" ? "Switch to Swahili" : "Badilisha kwa Kiingereza"}
    >
      <Languages className="h-5 w-5" />
      <span className="absolute -bottom-1 -right-1 text-[9px] bg-primary text-primary-foreground rounded px-0.5 leading-tight">
        {language === "en" ? "EN" : "SW"}
      </span>
    </Button>
  );
};

export default LanguageToggle;
