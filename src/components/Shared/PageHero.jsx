import bransonBull from '../../assets/branson-bull-real.png';

// Shared page header band — matches the home page's dark gradient theme.
export default function PageHero({ title, subtitle, children, rounded = false }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-[#003a6b] via-[#004B87] to-[#0a6aa8] ${rounded ? 'rounded-2xl' : ''}`}>
      <img
        src={bransonBull}
        alt=""
        className="absolute -right-10 -bottom-14 w-56 opacity-[0.08] pointer-events-none select-none"
      />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="relative max-w-6xl mx-auto px-6 py-10 lg:py-12">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2">{title}</h1>
        {subtitle && (
          <p className="text-sky-100/85 text-sm lg:text-base max-w-2xl leading-relaxed">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
}
