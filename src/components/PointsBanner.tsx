export default function PointsBanner() {
  return (
    <section className="bg-black px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[58rem]">
        <div className="flex items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-[#171717] px-6 py-5 shadow-[0_14px_40px_rgba(0,0,0,0.28)]">
          <div className="min-w-0">
            <h3 className="text-[1.28rem] font-semibold tracking-tight text-white">
              Acumula Neki Puntos
            </h3>
            <p className="mt-1 text-[0.82rem] leading-relaxed text-white/75">
              Regístrate, gana puntos con tus compras y canjealos por productos y más
            </p>
          </div>

          <button className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-[0.88rem] font-medium text-[#2a2a2a] transition-colors hover:bg-white/90">
            Únete
          </button>
        </div>
      </div>
    </section>
  );
}
