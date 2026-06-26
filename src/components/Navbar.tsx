import { ShoppingCart, MapPin, ChevronDown, LogIn, Search, MoreVertical } from "lucide-react";
import logoImg from "../images/MAkEBqYdvbC89vrw5-x-375.webp";

const categories = [
  "Promociones",
  "Promos de la Semana",
  "Boxes",
  "Poke",
  "Makis",
  "Entrada Fría",
  "Entradas Calientes",
  "Temakis",
  "Alitas",
  "Los favoritos de neki",
  "Meshi",
  "Sandwich",
];

export default function Navbar() {
  return (
    <header className="w-full border-b border-zinc-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 text-sm sm:px-6 lg:px-8">
          <nav className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 h-16">
            <a href="#" className="flex shrink-0 items-center">
              <img src={logoImg} alt="Mr. Sushi" className="h-8 w-auto object-contain" />
            </a>

            <div className="flex flex-row items-center gap-5 lg:gap-6">
              <a href="#" className="text-zinc-900 transition-colors hover:text-red-600">
                INICIO
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[rgb(251,35,1)] px-5 py-2 text-white transition-colors hover:bg-[rgb(225,31,1)]"
              >
                ¡PEDIR AQUÍ!
              </a>
              <a href="#" className="text-zinc-900 transition-colors hover:text-red-600">
                LOCALES & COBERTURA
              </a>
            </div>
          </nav>

          <div className="flex flex-1 items-center md:hidden">
            <a href="#" className="flex shrink-0 items-center">
              <img src={logoImg} alt="Mr. Sushi" className="h-8 w-auto object-contain" />
            </a>
          </div>

          <div className="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <nav className="flex items-center gap-3 md:hidden">
              <a
                href="#"
                className="rounded-full bg-[rgb(251,35,1)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[rgb(225,31,1)]"
              >
                Pedir
              </a>
            </nav>

            <button
              className="flex h-9 w-9 items-center justify-center text-zinc-950 transition-colors hover:text-red-600"
              aria-label="Iniciar sesión"
            >
              <LogIn size={26} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#242424] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button className="flex min-w-0 items-center gap-3 text-left text-lg font-normal tracking-tight text-white/90 transition-colors hover:text-white">
            <MapPin size={22} className="shrink-0" strokeWidth={1.9} />
            <span className="truncate">¿Dónde quieres pedir?</span>
            <ChevronDown size={20} className="shrink-0" strokeWidth={1.9} />
          </button>

          <div className="flex shrink-0 items-center gap-3 text-xl font-medium tracking-tight text-white">
            <span className="whitespace-nowrap">S/ 0.00</span>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
              aria-label="Carrito"
            >
              <ShoppingCart size={24} strokeWidth={1.9} />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center overflow-x-auto px-4 sm:px-6 lg:px-8 hide-scrollbar">
          <button className="mr-2 flex shrink-0 items-center justify-center p-2 text-zinc-950 transition-colors hover:text-red-600">
            <Search size={18} strokeWidth={2} />
          </button>
          {categories.map((cat) => (
            <a
              key={cat}
              href="#"
              className="shrink-0 px-3 py-4 text-[0.95rem] font-medium tracking-tight text-zinc-950 whitespace-nowrap transition-colors hover:text-red-600"
            >
              {cat}
            </a>
          ))}
          <button className="ml-3 flex shrink-0 items-center justify-center p-2 text-zinc-950 transition-colors hover:text-red-600">
            <MoreVertical size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
}
