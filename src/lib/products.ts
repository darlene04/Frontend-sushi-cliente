const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();

export interface BackendProductOption {
  name: string;
  min?: string;
  max?: string;
  type?: string;
  choices?: string[];
}

export interface BackendProduct {
  PK?: string;
  SK?: string;
  GSI1PK?: string;
  productId: string;
  name: string;
  description?: string;
  category: string;
  kitchenStation?: string;
  imageUrl?: string;
  price?: string;
  options?: BackendProductOption[];
}

export async function getProducts(): Promise<BackendProduct[]> {
  if (!API_BASE_URL) {
    throw new Error("Configura VITE_API_BASE_URL para conectar el catálogo del backend.");
  }

  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `HTTP ${response.status}`);
  }

  return Array.isArray(data) ? (data as BackendProduct[]) : [];
}
