import { Check, MapPin, X } from "lucide-react";
import { useEffect } from "react";
import { useShop } from "../context/ShopContext";

interface TenantSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TenantSelectorModal({ isOpen, onClose }: TenantSelectorModalProps) {
  const { tenants, selectedTenant, setSelectedTenantById } = useShop();

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 p-4">
      <button className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg rounded-[28px] border border-white/10 bg-[#161616] p-6 text-white shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">¿Dónde quieres pedir?</h2>
            <p className="mt-1 text-sm text-white/60">Selecciona la sede para tu pedido.</p>
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            onClick={onClose}
            aria-label="Cerrar selector de sedes"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {tenants.map((tenant) => {
            const isSelected = selectedTenant?.id === tenant.id;

            return (
              <button
                key={tenant.id}
                className={`flex w-full items-start justify-between rounded-2xl border px-4 py-4 text-left transition-colors ${
                  isSelected
                    ? "border-[rgb(251,35,1)] bg-[rgb(251,35,1)]/10"
                    : "border-white/10 bg-white/5 hover:bg-white/8"
                }`}
                onClick={() => {
                  setSelectedTenantById(tenant.id);
                  onClose();
                }}
              >
                <div className="flex gap-3">
                  <MapPin
                    size={18}
                    className={isSelected ? "text-[rgb(251,35,1)]" : "text-white/65"}
                  />
                  <div>
                    <p className="text-base font-medium text-white">{tenant.name}</p>
                    <p className="mt-1 text-sm text-white/60">{tenant.address}</p>
                  </div>
                </div>

                {isSelected ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgb(251,35,1)] text-white">
                    <Check size={16} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
