import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";


type MarketplaceScope = "buyer" | "seller" | "skill_owner";

interface BuyerActivity {
  hasOfferActivity: boolean;
  activeOrders?: number;
  shippedOrders?: number;
  disputedOrders?: number;
  activeOffers?: number;
  negotiatedOffers?: number;
  unreadOfferNotifications?: number;
}
interface SellerActivity {
  hasNewOrders: boolean;
  pending?: number;
  processing?: number;
  shipped?: number;
  unreadNotifications?: number;
}
interface SkillOwnerActivity {
  hasSkillUpdates: boolean;
  pendingOffers?: number;
  negotiatedOffers?: number;
  ongoingOffers?: number;
  unreadNotifications?: number;
}

interface MarketplaceActivityContextType {
  buyerActivity: BuyerActivity;
  sellerActivity: SellerActivity;
  skillOwnerActivity: SkillOwnerActivity;
  scope: MarketplaceScope;
  isConnected: boolean;
  setScope: (scope: MarketplaceScope) => void;
  setBusinessId: (id: string | undefined) => void;
  registerOnUpdate: (cb: () => void) => () => void;
}

const MarketplaceActivityContext = createContext<MarketplaceActivityContextType | undefined>(undefined);

export function useMarketplaceActivity() {
  const ctx = useContext(MarketplaceActivityContext);
  if (!ctx) throw new Error("useMarketplaceActivity must be used within MarketplaceActivityProvider");
  return ctx;
}

export function MarketplaceActivityProvider({
  children,
  initialScope = "buyer",
  initialBusinessId,
  initialUserId
}: {
  children: ReactNode;
  initialScope?: MarketplaceScope;
  initialBusinessId?: string;
  initialUserId?: string;
}) {

  const [scope, setScope] = useState<MarketplaceScope>(initialScope);
  const [businessId, setBusinessId] = useState<string | undefined>(initialBusinessId);
  const [isConnected, setIsConnected] = useState(false);

  const [buyerActivity, setBuyerActivity] = useState<BuyerActivity>({ hasOfferActivity: false });
  const [sellerActivity, setSellerActivity] = useState<SellerActivity>({ hasNewOrders: false });
  const [skillOwnerActivity, setSkillOwnerActivity] = useState<SkillOwnerActivity>({ hasSkillUpdates: false });

  const eventSourceRef = useRef<EventSource | null>(null);
  const updateCallbacks = useRef<Set<() => void>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    let url = `/api/marketplace/realtime/events?scope=${scope}`;
    if (scope === "seller" && businessId) {
      url += `&businessId=${businessId}`;
    }
    // userId is not needed, backend uses auth

    const connect = () => {
      try {
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.addEventListener("connected", () => {
          setIsConnected(true);
        });

        eventSource.addEventListener("ping", () => {
          // Heartbeat event
        });

        eventSource.addEventListener("update", (event) => {
          try {
            const data = JSON.parse((event as MessageEvent).data);
            if (scope === "buyer") {
              setBuyerActivity({
                hasOfferActivity: (data.unreadOfferNotifications ?? 0) > 0,
                activeOrders: data.activeOrders,
                shippedOrders: data.shippedOrders,
                disputedOrders: data.disputedOrders,
                activeOffers: data.activeOffers,
                negotiatedOffers: data.negotiatedOffers,
                unreadOfferNotifications: data.unreadOfferNotifications,
              });
            } else if (scope === "seller") {
              setSellerActivity({
                hasNewOrders: (data.pending ?? 0) > 0,
                pending: data.pending,
                processing: data.processing,
                shipped: data.shipped,
                unreadNotifications: data.unreadNotifications,
              });
            } else if (scope === "skill_owner") {
              setSkillOwnerActivity({
                hasSkillUpdates: (data.pendingOffers ?? 0) > 0 || (data.unreadNotifications ?? 0) > 0,
                pendingOffers: data.pendingOffers,
                negotiatedOffers: data.negotiatedOffers,
                ongoingOffers: data.ongoingOffers,
                unreadNotifications: data.unreadNotifications,
              });
            }
            updateCallbacks.current.forEach(cb => {
              try { cb(); } catch (err) { console.log(err); }
            });
          } catch (err) { console.log(err); }
        });

        eventSource.addEventListener("error", (err) => {
          eventSource.close();
          eventSourceRef.current = null;
          setIsConnected(false);
          // Auto-reconnect after 5s
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        });
      } catch (err) {
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      setIsConnected(false);
    };
  }, [scope, businessId]);

  const registerOnUpdate = (cb: () => void) => {
    updateCallbacks.current.add(cb);
    return () => updateCallbacks.current.delete(cb);
  };

  return (
    <MarketplaceActivityContext.Provider
      value={{
        buyerActivity,
        sellerActivity,
        skillOwnerActivity,
        scope,
        isConnected,
        setScope,
        setBusinessId,
        registerOnUpdate
      }}
    >
      {children}
    </MarketplaceActivityContext.Provider>
  );
}
