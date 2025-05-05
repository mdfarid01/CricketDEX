import { Link } from "wouter";
import { ConnectWalletButton } from "../wallet/connect-wallet-button";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const { isConnected } = useWallet();
  
  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <span className="text-primary font-bold text-xl mr-2 cursor-pointer">CricketDEX</span>
          </Link>
          <span className="bg-secondary text-white text-xs px-2 py-1 rounded">BETA</span>
        </div>
        
        <nav className="hidden md:flex space-x-4">
          <Link href="/">
            <span className="text-darkText hover:text-primary transition-colors cursor-pointer">Markets</span>
          </Link>
          <Link href="/cricket-matches">
            <span className="text-darkText hover:text-primary transition-colors cursor-pointer">Live Cricket</span>
          </Link>
          <Link href="/orderbook">
            <span className="text-darkText hover:text-primary transition-colors cursor-pointer">Orderbook</span>
          </Link>
          {isConnected && (
            <Link href="/portfolio">
              <span className="text-darkText hover:text-primary transition-colors cursor-pointer">Portfolio</span>
            </Link>
          )}
          <Link href="/how-it-works">
            <span className="text-darkText hover:text-primary transition-colors cursor-pointer">How It Works</span>
          </Link>
        </nav>
        
        <div className="flex items-center gap-2">
          <ConnectWalletButton />
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 pt-8">
                <Link href="/">
                  <span className="block py-2 text-darkText hover:text-primary transition-colors">Markets</span>
                </Link>
                <Link href="/orderbook">
                  <span className="block py-2 text-darkText hover:text-primary transition-colors">Orderbook</span>
                </Link>
                {isConnected && (
                  <Link href="/portfolio">
                    <span className="block py-2 text-darkText hover:text-primary transition-colors">Portfolio</span>
                  </Link>
                )}
                <Link href="/how-it-works">
                  <span className="block py-2 text-darkText hover:text-primary transition-colors">How It Works</span>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
