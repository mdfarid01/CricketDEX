import { useState, useEffect, useContext } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { WalletContext } from "@/context/wallet-context";

type WalletType = "metamask" | "walletconnect" | "coinbase";

export function useWallet() {
  const { toast } = useToast();
  const context = useContext(WalletContext);
  
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  
  const { wallet, setWallet } = context;
  const [isConnecting, setIsConnecting] = useState(false);
  
  const connectWallet = async (walletType: WalletType) => {
    try {
      setIsConnecting(true);
      
      // In a real app, this would use ethers.js to connect to the blockchain
      // For this demo, we'll simulate a successful connection
      const walletAddress = `0x${Math.random().toString(16).substring(2, 42)}`;
      
      // Call our backend to register/retrieve the user for this wallet
      const response = await apiRequest("POST", "/api/connect-wallet", {
        walletAddress,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setWallet({
          connected: true,
          address: walletAddress,
          userId: data.user.id,
          balance: data.user.balance,
          username: data.user.username,
        });
        
        toast({
          title: "Wallet connected successfully",
          description: `Connected as ${data.user.username}`,
        });
      }
    } catch (error) {
      toast({
        title: "Failed to connect wallet",
        description: (error as Error).message || "Please try again later",
        variant: "destructive",
      });
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };
  
  const disconnectWallet = () => {
    setWallet({
      connected: false,
      address: undefined,
      userId: undefined,
      balance: undefined,
      username: undefined,
    });
    
    toast({
      title: "Wallet disconnected",
    });
  };
  
  return {
    isConnected: wallet.connected,
    address: wallet.address,
    balance: wallet.balance,
    userId: wallet.userId,
    username: wallet.username,
    connectWallet,
    disconnectWallet,
    isConnecting,
  };
}
