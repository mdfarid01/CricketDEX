import { useState, useEffect, useContext } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { WalletContext } from "@/context/wallet-context";
import { ethers } from "ethers";

type WalletType = "metamask" | "walletconnect" | "coinbase";

declare global {
  interface Window {
    ethereum?: any;
    web3?: any;
  }
}

export function useWallet() {
  const { toast } = useToast();
  const context = useContext(WalletContext);
  
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  
  const { wallet, setWallet } = context;
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Check if the browser has Web3 support
  const isWeb3Available = typeof window !== 'undefined' && (window.ethereum || window.web3);
  
  const connectWallet = async (walletType: WalletType) => {
    try {
      setIsConnecting(true);
      let walletAddress = '';
      
      // Connect to Web3 provider
      if (walletType === "metamask" && window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        walletAddress = accounts[0];
        
        // Setup event listeners for account changes
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            // User disconnected
            disconnectWallet();
          } else {
            // User switched accounts
            const newAddress = accounts[0];
            updateWalletConnection(newAddress);
          }
        });
      } else {
        // Fallback to random address for other wallet types or if MetaMask isn't available
        walletAddress = `0x${Math.random().toString(16).substring(2, 42)}`;
      }
      
      await updateWalletConnection(walletAddress);
      
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
  
  const updateWalletConnection = async (walletAddress: string) => {
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
      
      return true;
    }
    
    return false;
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
    isWeb3Available,
  };
}
