import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearSession, loadSession, saveSession, type AuthSession } from "../lib/auth";
import { TENANTS, type TenantOption } from "../data/tenants";

export interface CartItemOption {
  name: string;
  qty: number;
}

export interface CartItem {
  id: string;
  productId: number;
  category: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  options: CartItemOption[];
}

interface AddToCartInput {
  productId: number;
  category: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  options?: CartItemOption[];
}

interface ShopContextValue {
  session: AuthSession | null;
  tenants: TenantOption[];
  selectedTenant: TenantOption | null;
  setSelectedTenantById: (tenantId: string) => void;
  setAuthenticatedSession: (session: AuthSession) => void;
  logout: () => void;
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: AddToCartInput) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  removeCartItem: (itemId: string) => void;
  clearCart: () => void;
}

const ShopContext = createContext<ShopContextValue | null>(null);
const GUEST_CART_KEY = "mrsushi.cart.guest";
const TENANT_STORAGE_KEY = "mrsushi.selected.tenant";

function getCartStorageKey(session: AuthSession | null, tenantId: string | null) {
  const cartOwner = session?.userId ? `user.${session.userId}` : GUEST_CART_KEY;
  const tenantKey = tenantId ?? "no-tenant";
  return `mrsushi.cart.${cartOwner}.${tenantKey}`;
}

function loadCart(storageKey: string): CartItem[] {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Array<Partial<CartItem>>;
    return parsed.map((item, index) => ({
      id: item.id ?? `legacy-${index}`,
      productId: item.productId ?? index,
      category: item.category ?? "Promociones",
      name: item.name ?? "Producto",
      image: item.image ?? "",
      unitPrice: item.unitPrice ?? 0,
      quantity: item.quantity ?? 1,
      options: item.options ?? [],
    }));
  } catch {
    localStorage.removeItem(storageKey);
    return [];
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  useEffect(() => {
    const currentSession = loadSession();
    const persistedTenantId = localStorage.getItem(TENANT_STORAGE_KEY) ?? TENANTS[0]?.id ?? null;
    setSession(currentSession);
    setSelectedTenantId(persistedTenantId);
    setCartItems(loadCart(getCartStorageKey(currentSession, persistedTenantId)));
  }, []);

  useEffect(() => {
    const storageKey = getCartStorageKey(session, selectedTenantId);
    localStorage.setItem(storageKey, JSON.stringify(cartItems));
  }, [cartItems, session, selectedTenantId]);

  const value = useMemo<ShopContextValue>(() => {
    const selectedTenant = TENANTS.find((tenant) => tenant.id === selectedTenantId) ?? null;
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cartItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0);

    return {
      session,
      tenants: TENANTS,
      selectedTenant,
      setSelectedTenantById: (tenantId) => {
        localStorage.setItem(TENANT_STORAGE_KEY, tenantId);
        setSelectedTenantId(tenantId);
        setCartItems(loadCart(getCartStorageKey(session, tenantId)));
      },
      setAuthenticatedSession: (nextSession) => {
        saveSession(nextSession);
        setSession(nextSession);
        setCartItems(loadCart(getCartStorageKey(nextSession, selectedTenantId)));
      },
      logout: () => {
        clearSession();
        setSession(null);
        setCartItems(loadCart(getCartStorageKey(null, selectedTenantId)));
      },
      cartItems,
      cartCount,
      cartTotal,
      addToCart: (item) => {
        setCartItems((current) => {
          const normalizedOptions = (item.options ?? []).filter((option) => option.qty > 0);
          const optionsKey = JSON.stringify(
            normalizedOptions.map((option) => ({ name: option.name, qty: option.qty })),
          );

          const existingIndex = current.findIndex(
            (cartItem) =>
              cartItem.productId === item.productId &&
              cartItem.category === item.category &&
              JSON.stringify(cartItem.options) === optionsKey,
          );

          if (existingIndex >= 0) {
            return current.map((cartItem, index) =>
              index === existingIndex
                ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                : cartItem,
            );
          }

          return [
            ...current,
            {
              id: `${item.productId}-${Date.now()}`,
              productId: item.productId,
              category: item.category,
              name: item.name,
              image: item.image,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              options: normalizedOptions,
            },
          ];
        });
      },
      updateCartItemQuantity: (itemId, quantity) => {
        setCartItems((current) =>
          current
            .map((item) => (item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item))
            .filter((item) => item.quantity > 0),
        );
      },
      removeCartItem: (itemId) => {
        setCartItems((current) => current.filter((item) => item.id !== itemId));
      },
      clearCart: () => {
        setCartItems([]);
      },
    };
  }, [cartItems, session, selectedTenantId]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop debe usarse dentro de ShopProvider.");
  }
  return context;
}
