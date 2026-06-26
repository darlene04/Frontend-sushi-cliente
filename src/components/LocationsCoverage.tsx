import { ChevronDown, MapPin, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { useShop } from "../context/ShopContext";

export default function LocationsCoverage() {
  const { tenants, selectedTenant, setSelectedTenantById } = useShop();
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");

  const districtOptions = useMemo(
    () => ["all", ...Array.from(new Set(tenants.map((tenant) => tenant.district)))],
    [tenants],
  );

  const visibleTenants =
    selectedDistrict === "all"
      ? tenants
      : tenants.filter((tenant) => tenant.district === selectedDistrict);

  return (
    <section id="locales-cobertura" className="bg-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1fr] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-[3rem] font-semibold tracking-tight text-white sm:text-[3.4rem]">
            ¡Busca tu local más cercano!
          </h2>
          <p className="mt-6 max-w-[36rem] text-[1.15rem] leading-relaxed text-white/80">
            Ingresa tu dirección para mostrarte los locales más cercanos
          </p>

          <div className="relative mt-6">
            <select
              className="w-full appearance-none rounded-2xl border border-white/10 bg-[#2a2a2a] px-5 py-4 pr-14 text-[1.05rem] text-white outline-none transition-colors hover:bg-[#313131] focus:border-white/30"
              value={selectedDistrict}
              onChange={(event) => setSelectedDistrict(event.target.value)}
            >
              <option value="all">Ingresa tu dirección</option>
              {districtOptions
                .filter((option) => option !== "all")
                .map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
            </select>
            <ChevronDown
              size={20}
              className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-white/75"
            />
          </div>
        </div>

        <div className="space-y-8">
          {visibleTenants.map((tenant) => {
            const isSelected = selectedTenant?.id === tenant.id;

            return (
              <button
                key={tenant.id}
                className={`w-full rounded-[22px] border px-7 py-7 text-left transition-colors ${
                  isSelected
                    ? "border-[rgb(251,35,1)] bg-[rgb(251,35,1)]/8"
                    : "border-white/10 bg-[#171717] hover:border-white/20 hover:bg-[#1b1b1b]"
                }`}
                onClick={() => setSelectedTenantById(tenant.id)}
                type="button"
              >
                <h3 className="text-[2.15rem] font-semibold tracking-tight text-white">
                  {tenant.name}
                </h3>
                <p className="mt-2 text-[1.05rem] leading-relaxed text-white/80">{tenant.address}</p>
                <div className="mt-2 flex items-center gap-2 text-[1.05rem] text-white/80">
                  <Phone size={16} />
                  <span>{tenant.phone}</span>
                </div>

                <div className="mt-4 space-y-1 text-[1.05rem] text-white/80">
                  {tenant.schedule.split("\n").map((line) => (
                    <p key={`${tenant.id}-${line}`}>{line}</p>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-2 text-sm font-medium text-white/65">
                  <MapPin size={15} />
                  Cobertura: {tenant.coverageLabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
