import type { CartItem } from "../context/ShopContext";
import type { AuthSession } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();

interface CreateOrderPayload {
  tenantId: string;
  customerId?: string;
  customer: {
    name: string;
    phone?: string;
    address: string;
    reference?: string;
  };
  items: Array<{
    productId: number;
    name: string;
    category: string;
    price: number;
    qty: number;
    options?: Array<{ name: string; qty: number }>;
  }>;
  source?: "web";
}

interface CreateOrderResponse {
  orderId: string;
  status: string;
}

export interface CustomerOrder {
  PK?: string;
  SK?: string;
  orderId?: string;
  status?: string;
  total?: string | number;
  createdAt?: string;
  tenantId?: string;
  currentStep?: string;
  steps?: Record<string, { takenAt?: string; phase?: string; completedAt?: string }>;
  customer?: {
    name?: string;
    address?: string;
    reference?: string;
  };
  items?: Array<{
    name?: string;
    qty?: number;
    price?: number | string;
    category?: string;
  }>;
}

function buildHeaders(session: AuthSession | null) {
  return {
    "Content-Type": "application/json",
    ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
  };
}

export async function createOrder(
  payload: CreateOrderPayload,
  session: AuthSession | null,
): Promise<CreateOrderResponse> {
  if (!API_BASE_URL) {
    throw new Error("Configura VITE_API_BASE_URL para conectar el checkout con el backend.");
  }

  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: buildHeaders(session),
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `HTTP ${response.status}`);
  }

  return data as CreateOrderResponse;
}

export async function getMyOrders(session: AuthSession): Promise<CustomerOrder[]> {
  if (!API_BASE_URL) {
    throw new Error("Configura VITE_API_BASE_URL para conectar el historial con el backend.");
  }

  const response = await fetch(`${API_BASE_URL}/orders?mine=true`, {
    method: "GET",
    headers: buildHeaders(session),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `HTTP ${response.status}`);
  }

  return Array.isArray(data) ? (data as CustomerOrder[]) : [];
}

export function buildOrderItems(cartItems: CartItem[]) {
  return cartItems.map((item) => ({
    productId: item.productId,
    name: item.name,
    category: item.category,
    price: item.unitPrice,
    qty: item.quantity,
    options: item.options.length > 0 ? item.options : undefined,
  }));
}
