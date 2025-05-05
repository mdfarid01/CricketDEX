import { createContext, useState, ReactNode } from "react";

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

export function WalletProvider({ children }: WalletProviderProps) {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
  });
  
  return (
    <WalletContext.Provider value={{ wallet, setWallet }}>
      {children}
    </WalletContext.Provider>
  );
}
