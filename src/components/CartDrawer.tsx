import { ChevronDown, LoaderCircle, MapPin, Minus, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useShop } from "../context/ShopContext";
import { buildOrderItems, createOrder } from "../lib/orders";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTenantSelector: () => void;
}

function formatCurrency(amount: number) {
  return `S/ ${amount.toFixed(2)}`;
}

export default function CartDrawer({
  isOpen,
  onClose,
  onOpenTenantSelector,
}: CartDrawerProps) {
  const {
    session,
    cartItems,
    cartCount,
    cartTotal,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    selectedTenant,
  } = useShop();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerReference, setCustomerReference] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "checkout">("cart");

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setCustomerName(session?.name ?? "");
    setCustomerPhone("");
    setCustomerAddress(selectedTenant?.address ?? "");
    setCustomerReference("");
    setSubmitError("");
    setSubmitSuccess("");
    setCheckoutStep("cart");
  }, [isOpen, selectedTenant, session]);

  if (!isOpen) return null;

  const originalTotal = cartItems.reduce(
    (total, item) => total + item.unitPrice * item.quantity * 1.1,
    0,
  );
  const discountTotal = originalTotal - cartTotal;
  const canSubmit = cartItems.length > 0 && !isSubmitting;

  const submitOrder = async () => {
    if (!selectedTenant) {
      setSubmitError("Selecciona un local antes de continuar.");
      return;
    }

    if (!customerName.trim() || !customerAddress.trim()) {
      setSubmitError("Ingresa tu nombre y dirección para enviar el pedido.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const result = await createOrder(
        {
          tenantId: selectedTenant.id,
          customerId: session?.userId,
          customer: {
            name: customerName.trim(),
            phone: customerPhone.trim() || undefined,
            address: customerAddress.trim(),
            reference: customerReference.trim() || undefined,
          },
          items: buildOrderItems(cartItems),
          source: "web",
        },
        session,
      );

      clearCart();
      setSubmitSuccess(`Pedido enviado. Codigo: ${result.orderId}`);
      setCustomerPhone("");
      setCustomerReference("");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "No se pudo enviar el pedido al backend.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130]">
      <button className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />

      <aside className="absolute top-0 right-0 flex h-full w-full max-w-[430px] flex-col bg-[#151515] text-white shadow-[-20px_0_60px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="text-[1.6rem] font-semibold tracking-tight text-white">
            Tu Carrito({cartCount})
          </h2>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            onClick={onClose}
            aria-label="Cerrar carrito"
            type="button"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-4 px-5">
          <button
            className="flex w-full items-center justify-between rounded-2xl bg-white/8 px-4 py-3 text-left text-[0.95rem] text-white/90 transition-colors hover:bg-white/12"
            onClick={onOpenTenantSelector}
            type="button"
          >
            <span className="flex items-center gap-3">
              <MapPin size={18} />
              {selectedTenant ? selectedTenant.name : "¿Dónde quieres pedir?"}
            </span>
            <ChevronDown size={18} />
          </button>

          {checkoutStep === "checkout" ? (
            <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium text-white">Datos del pedido</h3>
                <button
                  className="text-xs text-white/65 transition-colors hover:text-white"
                  onClick={() => setCheckoutStep("cart")}
                  type="button"
                >
                  Volver al carrito
                </button>
              </div>

              <div className="mt-3 space-y-3">
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/30"
                  placeholder="Nombre del cliente"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                />
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/30"
                  placeholder="Telefono"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                />
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/30"
                  placeholder="Direccion de entrega"
                  value={customerAddress}
                  onChange={(event) => setCustomerAddress(event.target.value)}
                />
                <textarea
                  className="min-h-20 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/30"
                  placeholder="Referencia"
                  value={customerReference}
                  onChange={(event) => setCustomerReference(event.target.value)}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-5">
          <div className="border-t border-white/10 pt-5">
            {cartItems.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/3 px-5 py-10 text-center text-white/60">
                Tu carrito está vacío.
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="border-b border-white/10 py-5">
                  <div className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="max-w-[15ch] text-[0.95rem] leading-tight font-semibold text-white">
                            {item.name}
                          </h3>
                          {item.options.length > 0 ? (
                            <ul className="mt-1.5 space-y-0.5 text-[0.78rem] leading-5 text-white/65">
                              {item.options.map((option) => (
                                <li key={`${item.id}-${option.name}`} className="flex gap-2">
                                  <span className="text-white/55">•</span>
                                  <span>
                                    {option.qty > 1 ? `${option.qty} ` : ""}
                                    {option.name}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>

                        <div className="text-right">
                          <p className="text-[0.92rem] font-medium text-white">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </p>
                          <p className="mt-1 text-[0.8rem] text-white/45 line-through">
                            {formatCurrency(item.unitPrice * item.quantity * 1.1)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 rounded-full bg-white/8 px-4 py-2.5">
                          <button
                            className="text-white/80 transition-colors hover:text-white"
                            onClick={() =>
                              item.quantity === 1
                                ? removeCartItem(item.id)
                                : updateCartItemQuantity(item.id, item.quantity - 1)
                            }
                            aria-label="Disminuir producto"
                            type="button"
                          >
                            {item.quantity === 1 ? <Trash2 size={18} /> : <Minus size={18} />}
                          </button>
                          <span className="min-w-4 text-center text-[0.95rem]">{item.quantity}</span>
                          <button
                            className="text-white/80 transition-colors hover:text-white"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                            aria-label="Aumentar producto"
                            type="button"
                          >
                            <Plus size={18} />
                          </button>
                        </div>

                        <button
                          className="rounded-full bg-white/10 px-4 py-2.5 text-[0.82rem] text-white/85 transition-colors hover:bg-white/15"
                          onClick={() => removeCartItem(item.id)}
                          type="button"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-white/10 px-5 py-5">
          <div className="space-y-1 text-[0.95rem] text-white/85">
            <div className="flex items-center justify-between">
              <span>Total Productos</span>
              <span>{formatCurrency(originalTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Descuentos</span>
              <span>- {formatCurrency(discountTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-[1.05rem] font-semibold text-white">
              <span>Subtotal</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          {submitError ? <p className="mt-4 text-sm text-red-400">{submitError}</p> : null}
          {submitSuccess ? <p className="mt-4 text-sm text-emerald-400">{submitSuccess}</p> : null}

          {checkoutStep === "checkout" ? (
            <button
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e6b73e] px-6 py-3.5 text-[0.95rem] font-medium text-white transition-colors hover:bg-[#d9a92e] disabled:cursor-not-allowed disabled:opacity-70"
              onClick={submitOrder}
              disabled={!canSubmit}
              type="button"
            >
              {isSubmitting ? <LoaderCircle size={18} className="animate-spin" /> : null}
              <span>{isSubmitting ? "Enviando pedido..." : "Enviar pedido"}</span>
            </button>
          ) : (
            <button
              className="mt-6 w-full rounded-2xl bg-[#e6b73e] px-6 py-3.5 text-[0.95rem] font-medium text-white transition-colors hover:bg-[#d9a92e] disabled:cursor-not-allowed disabled:opacity-70"
              onClick={() => setCheckoutStep("checkout")}
              disabled={cartItems.length === 0}
              type="button"
            >
              Continuar con los datos de entrega
            </button>
          )}
          <button
            className="mt-3 w-full rounded-2xl bg-white/10 px-6 py-3.5 text-[0.95rem] font-medium text-white/80 transition-colors hover:bg-white/15"
            onClick={onClose}
            type="button"
          >
            {checkoutStep === "checkout" ? "Seguir comprando" : "Cerrar carrito"}
          </button>
        </div>
      </aside>
    </div>
  );
}
