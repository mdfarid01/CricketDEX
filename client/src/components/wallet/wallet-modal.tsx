import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connectWallet, isConnecting, isWeb3Available } = useWallet();
  
  const handleConnectMetaMask = async () => {
    await connectWallet("metamask");
    onClose();
  };
  
  const handleConnectWalletConnect = async () => {
    await connectWallet("walletconnect");
    onClose();
  };
  
  const handleConnectCoinbase = async () => {
    await connectWallet("coinbase");
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Connect your wallet to place bets and receive winnings directly to your account.
          </DialogDescription>
        </DialogHeader>
        
        {!isWeb3Available && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No Web3 provider detected. Please install MetaMask or another compatible wallet to connect.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-3 pt-4">
          <Button
            variant="outline"
            className="w-full justify-between p-3 h-auto"
            onClick={handleConnectMetaMask}
            disabled={isConnecting || !isWeb3Available}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#F6851B] rounded-full mr-3 flex items-center justify-center">
                <span className="text-white text-xs font-bold">M</span>
              </div>
              <div className="text-left">
                <div className="font-medium">MetaMask</div>
                <div className="text-xs text-muted-foreground">Connect using browser wallet</div>
              </div>
            </div>
            {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-between p-3 h-auto"
            onClick={handleConnectWalletConnect}
            disabled={isConnecting}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#3B99FC] rounded-full mr-3 flex items-center justify-center">
                <span className="text-white text-xs font-bold">W</span>
              </div>
              <div className="text-left">
                <div className="font-medium">WalletConnect</div>
                <div className="text-xs text-muted-foreground">Scan with mobile wallet</div>
              </div>
            </div>
            {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-between p-3 h-auto"
            onClick={handleConnectCoinbase}
            disabled={isConnecting}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#0052FF] rounded-full mr-3 flex items-center justify-center">
                <span className="text-white text-xs font-bold">C</span>
              </div>
              <div className="text-left">
                <div className="font-medium">Coinbase Wallet</div>
                <div className="text-xs text-muted-foreground">Connect using Coinbase Wallet</div>
              </div>
            </div>
            {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          </Button>
          
          {/* This is a fallback option if no wallet is available */}
          {!isWeb3Available && (
            <Button
              className="w-full mt-4"
              onClick={() => {
                connectWallet("metamask"); // Will use fallback functionality
                onClose();
              }}
              disabled={isConnecting}
            >
              Continue without wallet
              {isConnecting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </Button>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground pt-2">
          By connecting your wallet, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
        </div>
      </DialogContent>
    </Dialog>
  );
}
