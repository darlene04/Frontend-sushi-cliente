import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Minus, Plus, X } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { getProducts, type BackendProduct } from "../lib/products";

function parsePrice(value?: string) {
  const amount = Number.parseFloat(value ?? "0");
  return Number.isFinite(amount) ? amount : 0;
}

function formatPrice(value: number) {
  return `S/ ${value.toFixed(2)}`;
}

function estimatedOriginalPrice(price: number) {
  if (price <= 0) return 0;
  return Number((price * 1.1).toFixed(2));
}

function fallbackDiscount(price: number) {
  return price > 0 ? 10 : 0;
}

export default function Promotions() {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<BackendProduct | null>(null);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { addToCart } = useShop();

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError("");

    getProducts()
      .then((data) => {
        if (!isCancelled) setProducts(data);
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "No se pudo cargar el catálogo.");
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedProduct]);

  const visibleProducts = useMemo(() => products.slice(0, 12), [products]);

  const openProductDetail = (product: BackendProduct) => {
    setSelectedProduct(product);
    setSelectedChoices({});
    setQuantity(1);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  const selectChoice = (groupName: string, choice: string) => {
    setSelectedChoices((current) => ({ ...current, [groupName]: choice }));
  };

  const buildCartOptions = (product: BackendProduct) =>
    (product.options ?? [])
      .map((group) => ({
        name: selectedChoices[group.name],
        qty: selectedChoices[group.name] ? 1 : 0,
      }))
      .filter((option) => option.name);

  const addProductToCart = (product: BackendProduct, nextQuantity = 1) => {
    addToCart({
      productId: product.productId,
      category: product.category,
      name: product.name,
      image: product.imageUrl ?? "",
      unitPrice: parsePrice(product.price),
      quantity: nextQuantity,
      options: buildCartOptions(product) as Array<{ name: string; qty: number }>,
    });
  };

  return (
    <>
      <section className="bg-black px-4 pb-8 pt-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-5 text-[2.1rem] font-semibold tracking-tight text-white">Promociones</h2>

          {isLoading ? (
            <div className="flex min-h-60 items-center justify-center rounded-[28px] border border-white/10 bg-[#171717] text-white/75">
              <LoaderCircle size={24} className="animate-spin" />
            </div>
          ) : error ? (
            <div className="rounded-[28px] border border-red-400/25 bg-red-500/10 px-6 py-5 text-red-200">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              {visibleProducts.map((product) => {
                const price = parsePrice(product.price);
                const originalPrice = estimatedOriginalPrice(price);
                const discount = fallbackDiscount(price);

                return (
                  <div
                    key={product.productId}
                    className="group flex min-h-[210px] cursor-pointer overflow-hidden rounded-2xl border border-white/12 bg-[#141414] text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-all hover:border-white/20 hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
                    onClick={() => openProductDetail(product)}
                  >
                    <div className="relative w-[41%] min-w-[150px] overflow-hidden bg-[#101010]">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                      {discount > 0 ? (
                        <span className="absolute top-3 left-3 z-10 rounded-full bg-white px-3 py-1 text-[0.85rem] leading-none font-semibold text-[#1c1c1c]">
                          -{discount}%
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="mb-2 max-w-[14ch] text-[0.92rem] leading-[1.15] font-semibold tracking-tight text-white sm:text-[0.98rem]">
                        {product.name}
                      </h3>
                      <p className="mb-4 max-w-[26ch] flex-1 text-[0.72rem] leading-6 text-white/80">
                        {product.description ?? product.category}
                      </p>
                      <div className="mt-auto flex items-end justify-between gap-4">
                        <div className="flex items-end gap-3">
                          <p className="text-[0.82rem] leading-none font-medium text-white">
                            {formatPrice(price)}
                          </p>
                          {originalPrice > price ? (
                            <p className="text-[0.72rem] leading-none text-white/45 line-through">
                              {formatPrice(originalPrice)}
                            </p>
                          ) : null}
                        </div>
                        <button
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-[1.6rem] leading-none font-light text-[#1a1a1a] transition-transform hover:scale-105"
                          onClick={(event) => {
                            event.stopPropagation();
                            addProductToCart(product, 1);
                          }}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {selectedProduct ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 md:p-6">
          <div className="relative flex h-[min(86vh,960px)] w-full max-w-[1800px] flex-col overflow-hidden rounded-[20px] border border-white/10 bg-[#111111] text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)] lg:grid lg:grid-cols-[1.02fr_1fr]">
            <button
              className="absolute top-5 right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              onClick={closeProductDetail}
              aria-label="Cerrar detalle"
              type="button"
            >
              <X size={28} strokeWidth={2} />
            </button>

            <div className="min-h-[280px] bg-[#171717] lg:min-h-0">
              <img
                src={selectedProduct.imageUrl}
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
                  {selectedProduct.description ?? selectedProduct.category}
                </p>

                {(selectedProduct.options ?? []).length > 0 ? (
                  <div className="mt-10 space-y-8">
                    {selectedProduct.options?.map((group) => (
                      <div key={group.name}>
                        <div className="mb-4 flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-2xl font-semibold tracking-tight text-white">
                              {group.name}
                            </h4>
                            <p className="mt-2 text-lg text-white/55">
                              {group.min === "1" ? "Selecciona 1 opción" : "Opcional"}
                            </p>
                          </div>
                          {group.min === "1" ? (
                            <span className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black">
                              Obligatorio
                            </span>
                          ) : null}
                        </div>

                        <div className="space-y-3">
                          {group.choices?.map((choice) => {
                            const selected = selectedChoices[group.name] === choice;

                            return (
                              <button
                                key={`${group.name}-${choice}`}
                                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-colors ${
                                  selected
                                    ? "border-[rgb(251,35,1)] bg-[rgb(251,35,1)]/10"
                                    : "border-white/10 bg-white/4 hover:bg-white/7"
                                }`}
                                onClick={() => selectChoice(group.name, choice)}
                                type="button"
                              >
                                <span className="text-lg text-white/95">{choice}</span>
                                <span
                                  className={`h-5 w-5 rounded-full border ${
                                    selected
                                      ? "border-[rgb(251,35,1)] bg-[rgb(251,35,1)]"
                                      : "border-white/35"
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="absolute right-0 bottom-0 left-0 border-t border-white/10 bg-[#111111] px-6 py-4 md:px-10 lg:left-[50%] lg:px-12">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/35 text-white transition-colors hover:bg-white/10"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      aria-label="Disminuir cantidad"
                      type="button"
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
                      type="button"
                    >
                      <Plus size={22} strokeWidth={2.2} />
                    </button>
                  </div>

                  <button
                    className="flex h-14 flex-1 items-center justify-between rounded-xl bg-white px-6 text-xl font-medium text-black transition-colors hover:bg-white/90"
                    onClick={() => {
                      if (!selectedProduct) return;
                      addProductToCart(selectedProduct, quantity);
                      closeProductDetail();
                    }}
                    type="button"
                  >
                    <span>Agregar</span>
                    <span>{formatPrice(parsePrice(selectedProduct.price))}</span>
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
