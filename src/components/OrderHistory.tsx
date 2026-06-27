import { useEffect, useState } from "react";
import { CircleCheckBig, LoaderCircle, PackageSearch } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { getMyOrders, type CustomerOrder } from "../lib/orders";

const ORDER_STAGES = [
  { key: "recibido", label: "Recibido" },
  { key: "cocinando", label: "En cocina" },
  { key: "listo", label: "Listo" },
  { key: "despachando", label: "En camino" },
  { key: "entregado", label: "Entregado" },
] as const;

function formatCurrency(value: string | number | undefined) {
  const amount = typeof value === "string" ? Number.parseFloat(value) : value ?? 0;
  return `S/ ${Number.isFinite(amount) ? amount.toFixed(2) : "0.00"}`;
}

function normalizeOrderId(order: CustomerOrder) {
  if (order.orderId) return order.orderId;
  if (order.SK?.startsWith("ORDER#")) return order.SK.replace("ORDER#", "");
  return "Pedido";
}

function formatDate(value?: string) {
  if (!value) return "Fecha no disponible";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function normalizeStatus(order: CustomerOrder) {
  const raw = (order.status ?? "").toLowerCase();
  const steps = order.steps ?? {};

  if (raw === "entregado") return "entregado";
  if (raw === "despachando" || raw === "repartiendo") return "despachando";
  if (raw === "listo" || raw === "empaquetado") return "listo";
  if (raw === "cocinando") return "cocinando";

  const hasKitchenStarted = Boolean(
    steps.cocina_fria?.takenAt ||
      steps.cocina_caliente?.takenAt ||
      steps.cocina_fria?.phase === "completed" ||
      steps.cocina_caliente?.phase === "completed",
  );
  const hasPacked = Boolean(steps.empacar?.takenAt || steps.empacar?.phase === "completed");
  const hasDelivery = Boolean(steps.repartir?.takenAt || steps.entregar_rappi?.takenAt);

  if (hasDelivery) return "despachando";
  if (hasPacked) return "listo";
  if (hasKitchenStarted) return "cocinando";
  return "recibido";
}

function statusLabel(status: string) {
  return ORDER_STAGES.find((stage) => stage.key === status)?.label ?? status;
}

function stageState(orderStatus: string, stageKey: string) {
  const orderIndex = ORDER_STAGES.findIndex((stage) => stage.key === orderStatus);
  const stageIndex = ORDER_STAGES.findIndex((stage) => stage.key === stageKey);

  if (orderStatus === "cancelado") return "pending";
  if (stageIndex < orderIndex) return "done";
  if (stageIndex === orderIndex) return "current";
  return "pending";
}

export default function OrderHistory() {
  const { session } = useShop();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!session) return;

    let isCancelled = false;

    const fetchOrders = async (showLoader: boolean) => {
      if (showLoader) setIsLoading(true);
      setError("");

      try {
        const data = await getMyOrders(session);
        if (!isCancelled) {
          setOrders(data);
          setLastUpdatedAt(new Date());
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "No se pudo cargar el historial.");
        }
      } finally {
        if (!isCancelled && showLoader) setIsLoading(false);
      }
    };

    void fetchOrders(true);
    const intervalId = window.setInterval(() => {
      void fetchOrders(false);
    }, 15000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [session]);

  if (!session) {
    return (
      <section className="bg-black px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[28px] border border-white/10 bg-[#171717] px-8 py-14 text-center text-white">
          <h2 className="text-4xl font-semibold tracking-tight">Mis pedidos</h2>
          <p className="mt-4 text-lg text-white/65">
            Inicia sesión para ver el historial de pedidos de tu cuenta.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-[3rem] font-semibold tracking-tight text-white">Mis pedidos</h2>
            <p className="mt-3 text-[1.05rem] text-white/65">
              Revisa el estado y detalle de los pedidos asociados a tu cuenta.
            </p>
          </div>

          <div className="text-sm text-white/45">
            {lastUpdatedAt
              ? `Actualizado: ${lastUpdatedAt.toLocaleTimeString("es-PE", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}`
              : "Actualizando..."}
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-60 items-center justify-center rounded-[28px] border border-white/10 bg-[#171717] text-white/75">
            <LoaderCircle size={24} className="animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-[28px] border border-red-400/25 bg-red-500/10 px-6 py-5 text-red-200">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center rounded-[28px] border border-white/10 bg-[#171717] text-center text-white/65">
            <PackageSearch size={38} className="mb-4" />
            <p className="text-xl font-medium text-white">Aún no tienes pedidos registrados</p>
            <p className="mt-2 text-sm">Cuando envíes uno desde el carrito, aparecerá aquí.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const normalized = normalizeStatus(order);

              return (
                <article
                  key={`${normalizeOrderId(order)}-${order.createdAt ?? ""}`}
                  className="rounded-[26px] border border-white/10 bg-[#171717] px-6 py-6 text-white"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-semibold tracking-tight">
                          Pedido #{normalizeOrderId(order)}
                        </h3>
                        <span className="rounded-full bg-[rgb(251,35,1)]/12 px-3 py-1 text-sm text-[rgb(255,121,98)]">
                          {statusLabel(normalized)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-white/55">{formatDate(order.createdAt)}</p>
                      {order.customer?.address ? (
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">
                          {order.customer.address}
                        </p>
                      ) : null}
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-sm text-white/55">Total</p>
                      <p className="text-2xl font-semibold">{formatCurrency(order.total)}</p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[22px] border border-white/8 bg-black/15 px-4 py-4">
                    <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white/75">
                      <CircleCheckBig size={16} />
                      Seguimiento del pedido
                    </div>

                    <div className="grid gap-3 md:grid-cols-5">
                      {ORDER_STAGES.map((stage) => {
                        const state = stageState(normalized, stage.key);
                        const isDone = state === "done";
                        const isCurrent = state === "current";

                        return (
                          <div
                            key={`${normalizeOrderId(order)}-${stage.key}`}
                            className={`rounded-2xl border px-4 py-3 text-center ${
                              isDone
                                ? "border-emerald-400/25 bg-emerald-500/10"
                                : isCurrent
                                  ? "border-[rgb(251,35,1)]/30 bg-[rgb(251,35,1)]/10"
                                  : "border-white/10 bg-white/5"
                            }`}
                          >
                            <div
                              className={`text-xs uppercase tracking-[0.18em] ${
                                isDone
                                  ? "text-emerald-300"
                                  : isCurrent
                                    ? "text-[rgb(255,121,98)]"
                                    : "text-white/35"
                              }`}
                            >
                              {isDone ? "Hecho" : isCurrent ? "Actual" : "Pendiente"}
                            </div>
                            <div className="mt-2 text-sm font-medium text-white">{stage.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {order.items?.length ? (
                    <div className="mt-5 border-t border-white/10 pt-5">
                      <p className="mb-3 text-sm font-medium text-white/75">Productos</p>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div
                            key={`${normalizeOrderId(order)}-${item.name ?? index}`}
                            className="flex items-center justify-between gap-3 text-sm text-white/75"
                          >
                            <span>
                              {item.qty ?? 1} x {item.name ?? "Producto"}
                            </span>
                            <span>{formatCurrency(item.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
