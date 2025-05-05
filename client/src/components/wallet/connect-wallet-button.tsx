import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { WalletModal } from "./wallet-modal";
import { useState } from "react";
import { truncateAddress } from "@/lib/utils";

export function ConnectWalletButton() {
  const { isConnected, address, balance } = useWallet();
  const [showModal, setShowModal] = useState(false);
  
  const handleClick = () => {
    setShowModal(true);
  };
  
  return (
    <>
      <Button
        className="flex items-center"
        onClick={handleClick}
      >
        <Wallet className="mr-2 h-4 w-4" />
        <span>
          {isConnected
            ? `${truncateAddress(address || "")} (₹${balance})`
            : "Connect Wallet"}
        </span>
      </Button>
      
      <WalletModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
