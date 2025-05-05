import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ExternalLink, FileText } from "lucide-react";

interface SmartContractVerificationProps {
  userId?: number;
}

export function SmartContractVerification({ userId }: SmartContractVerificationProps) {
  const blockNumber = 14258693;
  const contractAddress = "0x8942c06fAA74cEBFf07d44E984cF9c5481C5640c";
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-primary" />
          <span>Blockchain Verification</span>
        </CardTitle>
        <CardDescription>
          All bets are recorded on-chain for maximum transparency
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Last Block:</span>
          <span className="font-mono font-medium">#{blockNumber.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Contract Address:</span>
          <span className="font-mono text-xs">{contractAddress.substring(0, 12)}...{contractAddress.substring(contractAddress.length - 6)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Network:</span>
          <span className="font-medium">Polygon Mainnet</span>
        </div>
        
        <div className="mt-4">
          <h4 className="font-medium mb-2">Recent Transactions</h4>
          {userId ? (
            <div className="text-center py-4 border border-border rounded-md">
              <p className="text-sm text-muted-foreground">No blockchain transactions yet</p>
            </div>
          ) : (
            <div className="text-center py-4 border border-border rounded-md">
              <p className="text-sm text-muted-foreground">Connect wallet to view transactions</p>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <h4 className="font-medium mb-2">Your Bet History</h4>
          {userId ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 hover:bg-muted rounded-md">
                <div>
                  <div className="font-medium">RCB to win</div>
                  <div className="text-xs text-muted-foreground">vs • May 5, 15:35</div>
                </div>
                <div className="font-mono">{formatCurrency(4750)}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 border border-border rounded-md">
              <p className="text-sm text-muted-foreground">Connect wallet to view bet history</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" className="w-full flex items-center justify-center" asChild>
          <a href="#" onClick={(e) => {
            e.preventDefault();
            window.open(`https://polygonscan.com/address/${contractAddress}`, '_blank');
          }}>
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>View Smart Contract</span>
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}