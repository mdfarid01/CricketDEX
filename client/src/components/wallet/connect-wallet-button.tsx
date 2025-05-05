import { Button } from "@/components/ui/button";
import { Wallet, ChevronDown, LogOut } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { WalletModal } from "./wallet-modal";
import { useState } from "react";
import { truncateAddress } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ConnectWalletButton() {
  const { isConnected, address, balance, username, disconnectWallet } = useWallet();
  const [showModal, setShowModal] = useState(false);
  
  const handleConnectClick = () => {
    setShowModal(true);
  };
  
  const handleDisconnect = () => {
    disconnectWallet();
  };
  
  if (!isConnected) {
    return (
      <>
        <Button
          className="flex items-center"
          onClick={handleConnectClick}
        >
          <Wallet className="mr-2 h-4 w-4" />
          <span>Connect Wallet</span>
        </Button>
        
        <WalletModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      </>
    );
  }
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="flex items-center" variant="default">
            <Wallet className="mr-2 h-4 w-4" />
            <span className="mx-1">
              {truncateAddress(address || "")}
            </span>
            <span className="bg-primary-foreground text-primary rounded-full px-2 py-0.5 text-xs font-medium ml-1">
              ₹{balance}
            </span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled className="flex justify-between">
            <span>Username:</span>
            <span className="font-medium">{username}</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled className="flex justify-between">
            <span>Balance:</span>
            <span className="font-medium">₹{balance}</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled className="flex justify-between text-xs">
            <span>Address:</span>
            <span className="font-mono">{truncateAddress(address || "", 6, 4)}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDisconnect} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <WalletModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
