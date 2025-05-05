import { createContext, useState, ReactNode, useEffect } from "react";

interface WalletState {
  connected: boolean;
  address?: string;
  userId?: number;
  balance?: string;
  username?: string;
}

interface WalletContextType {
  wallet: WalletState;
  setWallet: (wallet: WalletState) => void;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

const WALLET_STORAGE_KEY = "cricket_betting_wallet";

export function WalletProvider({ children }: WalletProviderProps) {
  // Initialize state from localStorage if available
  const [wallet, setWallet] = useState<WalletState>(() => {
    if (typeof window === 'undefined') {
      return { connected: false };
    }
    
    const savedWallet = localStorage.getItem(WALLET_STORAGE_KEY);
    if (savedWallet) {
      try {
        return JSON.parse(savedWallet);
      } catch (e) {
        console.error("Failed to parse saved wallet", e);
        return { connected: false };
      }
    }
    
    return { connected: false };
  });
  
  // Save wallet state to localStorage whenever it changes
  useEffect(() => {
    if (wallet.connected && wallet.address) {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
    } else {
      localStorage.removeItem(WALLET_STORAGE_KEY);
    }
  }, [wallet]);
  
  // Function to update wallet state
  const updateWallet = (newWalletState: WalletState) => {
    setWallet(newWalletState);
  };
  
  return (
    <WalletContext.Provider value={{ wallet, setWallet: updateWallet }}>
      {children}
    </WalletContext.Provider>
  );
}
