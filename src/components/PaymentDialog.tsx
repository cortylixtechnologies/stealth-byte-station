import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Smartphone, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toolName: string;
  price: number;
}

const paymentMethods = [
  { id: "mpesa", name: "M-Pesa", color: "text-green-500", bgColor: "bg-green-500/10" },
  { id: "airtel", name: "Airtel Money", color: "text-red-500", bgColor: "bg-red-500/10" },
  { id: "tigopesa", name: "Tigo Pesa", color: "text-blue-500", bgColor: "bg-blue-500/10" },
];

const PaymentDialog = ({ open, onOpenChange, toolName, price }: PaymentDialogProps) => {
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast.error("Please enter your phone number");
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing - user will implement actual payment logic later
    console.log("Payment details:", {
      method: paymentMethod,
      phoneNumber,
      toolName,
      price,
    });

    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Payment request sent! Check your phone to complete the transaction.");
      onOpenChange(false);
      setPhoneNumber("");
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono">
            <CreditCard className="w-5 h-5 text-primary" />
            Pay for {toolName}
          </DialogTitle>
          <DialogDescription>
            Complete your purchase using mobile money
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Amount to pay:</span>
              <span className="text-2xl font-bold text-primary font-mono">${price}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border border-border cursor-pointer transition-all ${
                    paymentMethod === method.id ? `${method.bgColor} border-primary` : "hover:bg-muted/50"
                  }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex items-center gap-2 cursor-pointer flex-1">
                    <Smartphone className={`w-4 h-4 ${method.color}`} />
                    <span className="font-medium">{method.name}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g., +255 XXX XXX XXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Enter the phone number registered with your mobile money account
            </p>
          </div>

          <Button
            type="submit"
            className="w-full font-mono"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Processing...
              </span>
            ) : (
              `Pay $${price} via ${paymentMethods.find(m => m.id === paymentMethod)?.name}`
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
