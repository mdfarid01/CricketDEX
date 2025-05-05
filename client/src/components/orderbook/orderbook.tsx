import { useQuery } from "@tanstack/react-query";
import { Order, OrderType, OrderbookEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { RefreshCw, Info } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DepthBar } from "./depth-bar";
import { useWallet } from "@/hooks/use-wallet";
import { BetSlip } from "../betting/bet-slip";
import { formatCurrency, getMaxOrderAmount, getOrderbookDepthPercentage } from "@/lib/utils";

interface OrderbookProps {
  matchId: number;
}

export function Orderbook({ matchId }: OrderbookProps) {
  const { isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState("match_winner");
  const [selectedOrder, setSelectedOrder] = useState<{
    marketId: number;
    selectionName: string;
    price: string;
    type: OrderType;
  } | null>(null);
  
  // Fetch markets for this match
  const { data: markets, isLoading: marketsLoading } = useQuery({
    queryKey: [`/api/matches/${matchId}/markets`],
  });
  
  // Get the selected market
  const activeMarket = markets?.find(market => market.type === activeTab);
  
  // Fetch orders for the active market
  const { data: orderbookData, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: [activeMarket ? `/api/markets/${activeMarket.id}/orders` : null],
    enabled: !!activeMarket,
  });
  
  const isLoading = marketsLoading || ordersLoading;
  
  const handleBuy = (selectionName: string, price: string) => {
    if (!activeMarket) return;
    
    setSelectedOrder({
      marketId: activeMarket.id,
      selectionName,
      price,
      type: "buy"
    });
  };
  
  const handleSell = (selectionName: string, price: string) => {
    if (!activeMarket) return;
    
    setSelectedOrder({
      marketId: activeMarket.id,
      selectionName,
      price,
      type: "sell"
    });
  };
  
  const renderOrderbook = (orderbook: OrderbookEntry) => {
    const maxBidAmount = getMaxOrderAmount(orderbook.bids);
    const maxAskAmount = getMaxOrderAmount(orderbook.asks);
    
    return (
      <div key={orderbook.selection} className="mb-8">
        <h3 className="font-medium text-center mb-2">{orderbook.selection}</h3>
        
        <div className="overflow-hidden rounded-md border border-neutral-200 mb-4">
          <div className="grid grid-cols-3 bg-background text-sm font-medium">
            <div className="p-2 text-center">Price</div>
            <div className="p-2 text-center">Amount (₹)</div>
            <div className="p-2 text-center">Total (₹)</div>
          </div>
          
          {/* Ask Orders (Sell) */}
          <div className="max-h-[240px] overflow-y-auto scrollbar-hide">
            {orderbook.asks.map((order, index) => {
              const depthPercentage = getOrderbookDepthPercentage(order.amount, maxAskAmount);
              let totalAmount = 0;
              
              // Calculate cumulative total amount
              for (let i = 0; i <= index; i++) {
                totalAmount += parseFloat(orderbook.asks[i].amount);
              }
              
              return (
                <div 
                  className="grid grid-cols-3 text-sm relative hover:bg-primary/10 transition-colors"
                  key={order.id}
                  onClick={() => handleBuy(orderbook.selection, order.price)}
                >
                  <DepthBar type="ask" percentage={depthPercentage} />
                  <div className="p-2 text-center text-warning font-mono relative z-1">{order.price}</div>
                  <div className="p-2 text-center font-mono relative z-1">{formatCurrency(order.amount)}</div>
                  <div className="p-2 text-center font-mono relative z-1">{formatCurrency(totalAmount)}</div>
                </div>
              );
            })}
          </div>
          
          {/* Spread */}
          <div className="grid grid-cols-3 bg-background py-1">
            <div className="px-2 text-center text-sm font-medium text-muted-foreground">Spread</div>
            <div className="px-2 text-center text-sm font-medium text-primary">
              {orderbook.asks.length > 0 && orderbook.bids.length > 0 
                ? (parseFloat(orderbook.asks[0].price) - parseFloat(orderbook.bids[0].price)).toFixed(2)
                : '0.00'
              }
            </div>
            <div className="px-2 text-center"></div>
          </div>
          
          {/* Bid Orders (Buy) */}
          <div className="max-h-[240px] overflow-y-auto scrollbar-hide">
            {orderbook.bids.map((order, index) => {
              const depthPercentage = getOrderbookDepthPercentage(order.amount, maxBidAmount);
              let totalAmount = 0;
              
              // Calculate cumulative total amount
              for (let i = 0; i <= index; i++) {
                totalAmount += parseFloat(orderbook.bids[i].amount);
              }
              
              return (
                <div 
                  className="grid grid-cols-3 text-sm relative hover:bg-primary/10 transition-colors"
                  key={order.id}
                  onClick={() => handleSell(orderbook.selection, order.price)}
                >
                  <DepthBar type="bid" percentage={depthPercentage} />
                  <div className="p-2 text-center text-accent font-mono relative z-1">{order.price}</div>
                  <div className="p-2 text-center font-mono relative z-1">{formatCurrency(order.amount)}</div>
                  <div className="p-2 text-center font-mono relative z-1">{formatCurrency(totalAmount)}</div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            className="bg-accent hover:bg-accent/90 text-white"
            disabled={!isConnected || orderbook.bids.length === 0}
            onClick={() => orderbook.bids.length > 0 && handleBuy(orderbook.selection, orderbook.bids[0].price)}
          >
            Buy @ {orderbook.bids.length > 0 ? orderbook.bids[0].price : 'N/A'}
          </Button>
          <Button
            className="bg-warning hover:bg-warning/90 text-white"
            disabled={!isConnected || orderbook.asks.length === 0}
            onClick={() => orderbook.asks.length > 0 && handleSell(orderbook.selection, orderbook.asks[0].price)}
          >
            Sell @ {orderbook.asks.length > 0 ? orderbook.asks[0].price : 'N/A'}
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm mb-6">
      <div className="border-b border-neutral-200">
        <Tabs defaultValue="match_winner" onValueChange={setActiveTab}>
          <TabsList className="bg-transparent border-b">
            <TabsTrigger value="match_winner">Match Winner</TabsTrigger>
            <TabsTrigger value="run_totals">Run Totals</TabsTrigger>
            <TabsTrigger value="player_props">Player Props</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">
            {activeMarket?.name} Orderbook
          </h2>
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-3"
                  onClick={() => refetchOrders()}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>How Orderbook Works</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        {!isConnected && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-amber-800 font-medium">Connect your wallet to place bets</p>
            <p className="text-amber-600 text-sm mt-1">You need to connect your blockchain wallet to place bets on this match.</p>
          </div>
        )}
        
        {isConnected && !selectedOrder && (
          <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-md">
            <p className="text-primary font-medium">Ready to place a bet?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {orderbookData && orderbookData.map((orderbook, index) => (
                <Button
                  key={`buy-${index}`}
                  className="bg-accent hover:bg-accent/90 text-white"
                  onClick={() => {
                    if (orderbook.bids.length > 0) {
                      handleBuy(orderbook.selection, orderbook.bids[0].price);
                    }
                  }}
                  disabled={!orderbook.bids.length}
                >
                  Buy {orderbook.selection}
                </Button>
              ))}
              {orderbookData && orderbookData.map((orderbook, index) => (
                <Button
                  key={`sell-${index}`}
                  className="bg-warning hover:bg-warning/90 text-white"
                  onClick={() => {
                    if (orderbook.asks.length > 0) {
                      handleSell(orderbook.selection, orderbook.asks[0].price);
                    }
                  }}
                  disabled={!orderbook.asks.length}
                >
                  Sell {orderbook.selection}
                </Button>
              ))}
              <Button
                variant="outline"
                className="text-muted-foreground"
                onClick={() => refetchOrders()}
              >
                Refresh Odds
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">You can also click directly on any price in the orderbook to place a bet at that odds.</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading orderbook...</p>
          </div>
        ) : orderbookData?.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">No orderbook data available</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {orderbookData?.map(renderOrderbook)}
          </div>
        )}
      </div>
      
      {selectedOrder && (
        <BetSlip
          marketId={selectedOrder.marketId}
          matchId={matchId}
          selectionName={selectedOrder.selectionName}
          price={selectedOrder.price}
          type={selectedOrder.type}
          onClear={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
