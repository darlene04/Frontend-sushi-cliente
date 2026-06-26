interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  discount: number;
  image: string;
}

const products: Product[] = [
  {
    id: 1,
    name: "25 makis + 06 alitas + 02 gaseosas",
    description: "Disfruta de 25 makis + 06 alitas + 02 gaseosas a elección (300 ml)",
    price: "S/ 69.90",
    originalPrice: "S/ 99.90",
    discount: 30,
    image: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80",
  },
  {
    id: 2,
    name: "1 Poke Bowl (a elección) + 1 bebida de 300 ml",
    description: "Disfruta de nuestro Poke bowl (a elección) + bebida de 300 ml",
    price: "S/ 34.90",
    originalPrice: "S/ 45.90",
    discount: 24,
    image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&q=80",
  },
  {
    id: 3,
    name: "Pack Llaveros Neki",
    description: "Elige tu Neki favorito y regálate un delicioso lleno de cariño. El complemento perfecto para...",
    price: "S/ 59.90",
    originalPrice: "S/ 99.90",
    discount: 40,
    image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80",
  },
];

export default function Promotions() {
  return (
    <section className="px-3 pb-8">
      <h2 className="text-sm font-bold text-gray-800 mb-3">Promociones</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col"
          >
            {/* Contenedor de imagen: posición relativa para el badge */}
            <div className="relative w-full" style={{ paddingBottom: "66%" }}>
              <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              {/* Badge de descuento sobre la imagen, esquina superior izquierda */}
              <span className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                -{product.discount}%
              </span>
            </div>

            {/* Info */}
            <div className="p-2.5 flex flex-col flex-1">
              <h3 className="font-semibold text-gray-800 text-[11px] leading-snug mb-1 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-[10px] text-gray-400 leading-snug line-clamp-2 mb-2 flex-1">
                {product.description}
              </p>
              <div className="flex items-end justify-between mt-auto">
                <div>
                  {/* Precio actual en rojo */}
                  <p className="text-[#E8001C] font-bold text-xs leading-tight">{product.price}</p>
                  {/* Precio original tachado, siempre visible */}
                  <p className="text-gray-400 text-[10px] line-through leading-tight">{product.originalPrice}</p>
                </div>
                <button className="bg-[#E8001C] text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition-colors text-base font-bold leading-none flex-shrink-0">
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
