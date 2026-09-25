import SEOMeta from "@/components/SEOMeta";

/**
 * Farewell page shown when VITE_SITE_CLOSING=true.
 * Copy is intentionally Spanish-only.
 */
const SiteClosing = () => {
  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      <SEOMeta
        title="Pronto cerramos — Bolsadecafé"
        description="Pronto cerraremos. Gracias por cada mañana que compartimos contigo."
        path="/"
        noIndex
      />

      <div className="absolute inset-0">
        <img
          src="https://disruptinglabs.com/data/bolsadecafe/assets/images/hero-image.jpg"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/50" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-16 text-center safe-top safe-bottom">
        <img
          src="https://disruptinglabs.com/data/bolsadecafe/assets/images/logo_white.png"
          alt="Bolsadecafé"
          className="mx-auto mb-10 h-10 w-auto animate-fadeUp opacity-90"
        />

        <div className="animate-fadeUp mb-6 flex items-center justify-center gap-3">
          <div className="h-px w-8 bg-brand-400/80" />
          <p className="text-brand-300 text-xs font-semibold uppercase tracking-[0.25em]">
            Con el corazón en la mano
          </p>
          <div className="h-px w-8 bg-brand-400/80" />
        </div>

        <h1 className="animate-fadeUp-d1 mb-8 text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
          Pronto{" "}
          <span className="italic font-light text-brand-200">cerraremos</span>
          {" "}esta puerta.
        </h1>

        <p className="animate-fadeUp-d2 mx-auto mb-4 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
          Gracias por dejarnos ser el primer aroma de tus mañanas, por cada taza
          compartida y por habernos llevado hasta tu mesa con tanto cariño.
        </p>

        <p className="animate-fadeUp-d2 mx-auto mb-10 max-w-lg text-base leading-relaxed text-white/60 sm:text-lg">
          Fue un privilegio acompañarte. Te llevamos en el corazón — siempre.
        </p>

        <a
          href="https://go-mez.com"
          target="_blank"
          rel="noopener noreferrer"
          className="animate-fadeUp-d2 mb-12 inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-medium text-white/90 backdrop-blur-sm transition-all duration-200 hover:border-white/50 hover:bg-white/10 hover:text-white"
        >
          ¿Quieres saber más? Escríbenos
        </a>

        <p className="animate-fadeUp-d2 text-sm font-medium tracking-wide text-brand-200/90">
          Con amor infinito,
          <br />
          <span className="mt-1 inline-block text-white/80">
            el equipo de Bolsadecafé
          </span>
        </p>
      </div>
    </div>
  );
};

export default SiteClosing;
