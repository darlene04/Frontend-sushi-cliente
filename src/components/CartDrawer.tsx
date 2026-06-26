import { Minus, Plus, Trash2, X, MapPin, ChevronDown } from "lucide-react";
import { useEffect } from "react";
import { useShop } from "../context/ShopContext";

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
    cartItems,
    cartCount,
    cartTotal,
    updateCartItemQuantity,
    removeCartItem,
    selectedTenant,
  } = useShop();

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const originalTotal = cartItems.reduce((total, item) => total + item.unitPrice * item.quantity * 1.1, 0);
  const discountTotal = originalTotal - cartTotal;

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
          >
            <X size={22} />
          </button>
        </div>

        <div className="px-5">
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
                          <h3 className="max-w-[12ch] text-[0.95rem] leading-tight font-semibold text-white">
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
                          >
                            {item.quantity === 1 ? <Trash2 size={18} /> : <Minus size={18} />}
                          </button>
                          <span className="min-w-4 text-center text-[0.95rem]">{item.quantity}</span>
                          <button
                            className="text-white/80 transition-colors hover:text-white"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                            aria-label="Aumentar producto"
                          >
                            <Plus size={18} />
                          </button>
                        </div>

                        <button className="rounded-full bg-white/10 px-4 py-2.5 text-[0.82rem] text-white/85 transition-colors hover:bg-white/15">
                          Editar
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

          <button className="mt-6 w-full rounded-2xl bg-[#e6b73e] px-6 py-3.5 text-[0.95rem] font-medium text-white transition-colors hover:bg-[#d9a92e]">
            Ingresa tu dirección o selecciona un local para continuar
          </button>
          <button className="mt-3 w-full rounded-2xl bg-white/10 px-6 py-3.5 text-[0.95rem] font-medium text-white/60">
            Continuar
          </button>
        </div>
      </aside>
    </div>
  );
}
