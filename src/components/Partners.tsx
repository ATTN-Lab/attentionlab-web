const PARTNERS: { name: string; src?: string; heightClass?: string }[] = [
  { name: "NVIDIA", src: "/partners/nvidia.png", heightClass: "h-12" },
  { name: "Microsoft", src: "/partners/microsoft.png", heightClass: "h-12" },
  { name: "Nucleate", src: "/partners/nucleate.png", heightClass: "h-10" },
  {
    name: "Harvard Medical School & Boston Children's Hospital",
    src: "/partners/hms-bch.png",
    heightClass: "h-14",
  },
];

const LoopItem = ({
  name,
  src,
  heightClass = "h-8",
}: {
  name: string;
  src?: string;
  heightClass?: string;
}) => (
  <div className="flex items-center justify-center h-24 px-10 shrink-0 whitespace-nowrap">
    {src ? (
      <img src={src} alt={name} className={`${heightClass} w-auto`} />
    ) : (
      <span className="text-sm font-bold tracking-wider uppercase">{name}</span>
    )}
  </div>
);

export default function Partners() {
  // Duplicate the list so the marquee can loop seamlessly
  const loop = [...PARTNERS, ...PARTNERS];

  const Row = () => (
    <div
      className="flex items-center"
      style={{
        animation: "marquee 30s linear infinite",
        width: "max-content",
      }}
    >
      {loop.map((p, i) => (
        <LoopItem
          key={`${p.name}-${i}`}
          name={p.name}
          src={p.src}
          heightClass={p.heightClass}
        />
      ))}
    </div>
  );

  return (
    <section className="py-12 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-xs uppercase tracking-[0.2em] text-gray-700 font-semibold text-center mb-6">
          Partners
        </div>
        <div className="relative overflow-hidden h-24">
          {/* Edge fades */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />

          {/* Base grayscale layer */}
          <div className="absolute inset-0 grayscale opacity-60">
            <Row />
          </div>

          {/* Color spotlight layer — clipped to a centered vertical strip */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              clipPath: "inset(0 calc(50% - 120px) 0 calc(50% - 120px))",
            }}
          >
            <Row />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
