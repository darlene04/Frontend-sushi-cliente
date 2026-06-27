export interface TenantOption {
  id: string;
  name: string;
  address: string;
  district: string;
  phone: string;
  schedule: string;
  coverageLabel: string;
}

export const TENANTS: TenantOption[] = [
  {
    id: "mrsushi-lamarina",
    name: "Mr. Sushi - La Marina",
    address: "Avenida de la Marina 2530, San Miguel, Perú",
    district: "San Miguel",
    phone: "+51989585587",
    schedule: "Lunes a Domingo\n10:00 — 22:30",
    coverageLabel: "San Miguel",
  },
  {
    id: "mrsushi-malldelsur",
    name: "Mr. Sushi - Mall del Sur",
    address: "Avenida Pedro Miotta 1011, San Juan de Miraflores, Perú",
    district: "San Juan de Miraflores",
    phone: "+51945642599",
    schedule: "Lunes a Domingo\n11:30 — 21:45",
    coverageLabel: "SJM",
  },
  {
    id: "mrsushi-espinar",
    name: "Mr. Sushi - Espinar",
    address: "Avenida Comandante Espinar 320, Miraflores, Perú",
    district: "Miraflores",
    phone: "+51989187503",
    schedule: "Lunes a Domingo\n11:00 — 21:45",
    coverageLabel: "Miraflores",
  },
  {
    id: "mrsushi-megaplaza",
    name: "Mr. Sushi - Mega Plaza",
    address: "Avenida Alfredo Mendiola 3698, San Martín de Porres, Perú",
    district: "San Martín de Porres",
    phone: "+51976329072",
    schedule: "Lunes a Domingo\n11:00 — 21:30",
    coverageLabel: "SMP",
  },
  {
    id: "minka",
    name: "Mr. Sushi - Minka",
    address: "CC Minka, Callao, Perú",
    district: "Callao",
    phone: "+51976420315",
    schedule: "Lunes a Domingo\n11:00 — 21:30",
    coverageLabel: "Callao",
  },
];
