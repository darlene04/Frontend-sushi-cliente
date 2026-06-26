import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import image1 from "../images/image1.png";
import image2 from "../images/image2.png";
import image3 from "../images/image3.png";

interface ProductOption {
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  discount: number;
  image: string;
  detailPrice: string;
  requiredLabel: string;
  requiredHelper: string;
  options: ProductOption[];
}

const products: Product[] = [
  {
    id: 1,
    name: "25 makis + 06 alitas + 02 gaseosas",
    description: "Disfruta de 25 makis + 06 alitas + 02 gaseosas a elección (300 ml)",
    price: "S/ 62.90",
    originalPrice: "S/ 69.90",
    discount: 10,
    image: image1,
    detailPrice: "S/ 62.90",
    requiredLabel: "Escoge 2 sabores de tus maki:",
    requiredHelper: "Seleccione 2",
    options: [
      { name: "Acevichado Maki" },
      { name: "Furai Maki" },
      { name: "Baby Maki" },
      { name: "Hiroshima Maki" },
      { name: "California Maki" },
      { name: "Inka Maki" },
      { name: "Kani Maki" },
      { name: "Philadelphia Maki" },
    ],
  },
  {
    id: 2,
    name: "1 Poke Bowl (a elección) + 1 bebida de 300 ml",
    description: "Disfruta de nuestro Poke bowl (a elección) + bebida de 300 ml",
    price: "S/ 25.00",
    originalPrice: "S/ 33.00",
    discount: 24,
    image: image2,
    detailPrice: "S/ 34.90",
    requiredLabel: "Escoge tu poke y bebida:",
    requiredHelper: "Seleccione 2",
    options: [
      { name: "Poke de salmon" },
      { name: "Poke de atun" },
      { name: "Poke mixto" },
      { name: "Inca Kola 300 ml" },
      { name: "Coca Cola 300 ml" },
      { name: "Sprite 300 ml" },
    ],
  },
  {
    id: 3,
    name: "Pack Llaveros Neki",
    description: "Elige tu Neki favorito y regálate un delicioso lleno de cariño. El complemento perfecto para...",
    price: "S/ 29.90",
    originalPrice: "S/ 49.90",
    discount: 40,
    image: image3,
    detailPrice: "S/ 59.90",
    requiredLabel: "Escoge tu combinación de llaveros:",
    requiredHelper: "Seleccione 2",
    options: [
      { name: "Neki rojo" },
      { name: "Neki negro" },
      { name: "Neki dorado" },
      { name: "Empaque regalo" },
      { name: "Tarjeta dedicatoria" },
    ],
  },
];

function formatCount(count: number) {
  return count.toString();
}

export default function Promotions() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!selectedProduct) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedProduct]);

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setSelectedOptions(
      Object.fromEntries(product.options.map((option) => [option.name, 0])),
    );
    setQuantity(1);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  const updateOptionCount = (optionName: string, delta: number) => {
    setSelectedOptions((current) => {
      const nextValue = Math.max(0, (current[optionName] ?? 0) + delta);
      return { ...current, [optionName]: nextValue };
    });
  };

  return (
    <>
      <section className="bg-black px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 text-3xl font-semibold tracking-tight text-white">Promociones</h2>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="group flex min-h-[255px] cursor-pointer overflow-hidden rounded-2xl border border-white/12 bg-[#141414] text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-all hover:border-white/20 hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              onClick={() => openProductDetail(product)}
            >
              <div className="relative w-[44%] min-w-[178px] overflow-hidden bg-[#101010]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <span className="absolute top-4 left-4 z-10 rounded-full bg-white px-3 py-1 text-[0.9rem] leading-none font-semibold text-[#1c1c1c]">
                  -{product.discount}%
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="mb-3 max-w-[13ch] text-[1rem] leading-[1.15] font-semibold tracking-tight text-white sm:text-[1.1rem]">
                  {product.name}
                </h3>
                <p className="mb-5 max-w-[24ch] flex-1 text-[0.82rem] leading-7 text-white/80">
                  {product.description}
                </p>
                <div className="mt-auto flex items-end justify-between gap-4">
                  <div className="flex items-end gap-3">
                    <p className="text-[0.95rem] leading-none font-medium text-white">{product.price}</p>
                    <p className="text-[0.8rem] leading-none text-white/45 line-through">
                      {product.originalPrice}
                    </p>
                  </div>
                  <button
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-[1.9rem] leading-none font-light text-[#1a1a1a] transition-transform hover:scale-105"
                    onClick={(event) => {
                      event.stopPropagation();
                      openProductDetail(product);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {selectedProduct ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 md:p-6">
          <div className="relative flex h-[min(86vh,960px)] w-full max-w-[1800px] flex-col overflow-hidden rounded-[20px] border border-white/10 bg-[#111111] text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)] lg:grid lg:grid-cols-[1.02fr_1fr]">
            <button
              className="absolute top-5 right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              onClick={closeProductDetail}
              aria-label="Cerrar detalle"
            >
              <X size={28} strokeWidth={2} />
            </button>

            <div className="min-h-[280px] bg-[#171717] lg:min-h-0">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex min-h-0 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-8 pb-28 md:px-10 md:pt-10 lg:px-12">
                <h3 className="max-w-[18ch] text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  {selectedProduct.name}
                </h3>
                <p className="mt-3 text-lg leading-relaxed text-white/60 md:text-[1.05rem]">
                  {selectedProduct.description}
                </p>

                <div className="mt-10 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-2xl font-semibold tracking-tight text-white">
                      {selectedProduct.requiredLabel}
                    </h4>
                    <p className="mt-2 text-lg text-white/55">{selectedProduct.requiredHelper}</p>
                  </div>
                  <span className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black">
                    Obligatorio
                  </span>
                </div>

                <div className="mt-8">
                  {selectedProduct.options.map((option) => (
                    <div
                      key={option.name}
                      className="flex items-center justify-between gap-4 border-b border-white/10 py-5"
                    >
                      <span className="text-xl font-medium tracking-tight text-white/95">
                        {option.name}
                      </span>
                      <div className="flex items-center gap-4">
                        <button
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/35 text-white transition-colors hover:bg-white/10"
                          onClick={() => updateOptionCount(option.name, -1)}
                          aria-label={`Disminuir ${option.name}`}
                        >
                          <Minus size={24} strokeWidth={2.2} />
                        </button>
                        <span className="min-w-4 text-center text-2xl text-white/95">
                          {formatCount(selectedOptions[option.name] ?? 0)}
                        </span>
                        <button
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/60 text-white transition-colors hover:bg-white/10"
                          onClick={() => updateOptionCount(option.name, 1)}
                          aria-label={`Aumentar ${option.name}`}
                        >
                          <Plus size={24} strokeWidth={2.2} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute right-0 bottom-0 left-0 border-t border-white/10 bg-[#111111] px-6 py-4 md:px-10 lg:left-[50%] lg:px-12">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/35 text-white transition-colors hover:bg-white/10"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      aria-label="Disminuir cantidad"
                    >
                      <Minus size={22} strokeWidth={2.2} />
                    </button>
                    <div className="flex h-14 min-w-20 items-center justify-center rounded-xl border border-white/10 bg-black/30 px-5 text-2xl font-medium text-white">
                      {quantity}
                    </div>
                    <button
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/60 text-white transition-colors hover:bg-white/10"
                      onClick={() => setQuantity((current) => current + 1)}
                      aria-label="Aumentar cantidad"
                    >
                      <Plus size={22} strokeWidth={2.2} />
                    </button>
                  </div>

                  <button className="flex h-14 flex-1 items-center justify-between rounded-xl bg-white px-6 text-xl font-medium text-black transition-colors hover:bg-white/90">
                    <span>Agregar</span>
                    <span>{selectedProduct.detailPrice}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            className="absolute inset-0 -z-10 cursor-default"
            aria-hidden="true"
            onClick={closeProductDetail}
          />
        </div>
      ) : null}
    </>
  );
}
