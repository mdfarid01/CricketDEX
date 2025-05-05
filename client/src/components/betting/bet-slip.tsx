import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { OrderType } from "@/types";
import { calculatePotentialProfit, calculatePotentialReturn, formatCurrency } from "@/lib/utils";

interface BetSlipProps {
  marketId: number;
  matchId: number;
  selectionName: string;
  price: string;
  type: OrderType;
  onClear: () => void;
}

export function BetSlip({ marketId, matchId, selectionName, price, type, onClear }: BetSlipProps) {
  const [amount, setAmount] = useState("1000");
  const { userId } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const potentialReturn = calculatePotentialReturn(amount, price);
  const potentialProfit = calculatePotentialProfit(amount, price);
  
  const placeBetMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/orders", {
        userId,
        marketId,
        type,
        price,
        amount,
        selectionName,
        status: "open"
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bet placed successfully",
        description: `Your ${type} order for ${selectionName} has been placed.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/markets/${marketId}/orders`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/bets`] });
      onClear();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place bet",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
  };
  
  const handleQuickAmount = (addAmount: number) => {
    const currentAmount = parseFloat(amount) || 0;
    setAmount((currentAmount + addAmount).toString());
  };
  
  const handlePlaceBet = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    placeBetMutation.mutate();
  };
  
  return (
    <div className="border border-neutral-200 rounded-md p-3 mb-4">
      <div className="flex justify-between items-center">
        <div className="font-medium">{selectionName}</div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClear}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex justify-between text-sm text-muted-foreground mt-1 mb-3">
        <div>Type: {type === "buy" ? "Back" : "Lay"}</div>
        <div className="font-mono">{price}</div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Bet Amount (₹)</label>
        <div className="relative">
          <Input 
            type="text" 
            value={amount} 
            onChange={handleAmountChange} 
            className="w-full border border-neutral-200 rounded-md py-2 px-3 font-mono text-right" 
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            ₹
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mb-3">
        <Button
          variant="outline"
          className="text-sm"
          onClick={() => handleQuickAmount(100)}
        >
          +₹100
        </Button>
        <Button
          variant="outline"
          className="text-sm"
          onClick={() => handleQuickAmount(500)}
        >
          +₹500
        </Button>
        <Button
          variant="outline"
          className="text-sm"
          onClick={() => handleQuickAmount(1000)}
        >
          +₹1000
        </Button>
        <Button
          variant="outline"
          className="text-sm"
          onClick={() => setAmount("5000")}
        >
          Max
        </Button>
      </div>
      
      <div className="bg-background rounded-md p-3">
        <div className="flex justify-between text-sm mb-1">
          <span>Potential Return:</span>
          <span className="font-mono">{formatCurrency(potentialReturn)}</span>
        </div>
        <div className="flex justify-between text-sm text-accent">
          <span>Potential Profit:</span>
          <span className="font-mono">{formatCurrency(potentialProfit)}</span>
        </div>
      </div>
      
      <div className="flex justify-between text-sm font-medium my-3">
        <span>Total Stake:</span>
        <span className="font-mono">{formatCurrency(amount)}</span>
      </div>
      
      <Button
        className="w-full"
        disabled={placeBetMutation.isPending}
        onClick={handlePlaceBet}
      >
        {placeBetMutation.isPending ? "Placing Bet..." : "Place Bet"}
      </Button>
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>All bets are final and recorded on blockchain. Please verify your selections before placing bets.</p>
      </div>
    </div>
  );
}
