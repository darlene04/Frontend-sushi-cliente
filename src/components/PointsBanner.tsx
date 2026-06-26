export default function PointsBanner() {
  return (
    <div className="mx-3 my-3">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-xs leading-tight">Acumula Neki Puntos</p>
          <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
            Regístrate, gana puntos con tus compras y canjéalos por productos y más
          </p>
        </div>
        {/* flex-shrink-0 garantiza que el botón nunca se comprima ni desaparezca */}
        <button className="flex-shrink-0 border border-gray-300 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
          Únete
        </button>
      </div>
    </div>
  );
}
