import { useNavigate } from "@tanstack/react-router";
import { Droplets, Shield, Zap } from "lucide-react";

export default function ProductLandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-charcoal-950 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img
          src="/assets/uploads/image-10-3.png"
          alt="AIron Automatic Ironing Machine"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/60 via-transparent to-charcoal-950" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20">
          <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
            <span className="text-gold-400 text-xs font-sans tracking-widest uppercase">
              Now Available
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            The Future of
            <br />
            <span className="text-gold-400">Effortless Ironing</span>
          </h1>

          <p className="text-silver-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            AIron uses advanced AI and precision steam technology to deliver a
            flawless press on every garment — automatically, in under 90
            seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              data-ocid="landing.explore_features.primary_button"
              onClick={() => navigate({ to: "/features" })}
              className="btn-gold px-8 py-4 rounded-full font-semibold text-base tracking-wide hover:scale-105 hover:brightness-110 active:scale-95 transition-all duration-200"
            >
              Explore Features
            </button>
            <button
              type="button"
              data-ocid="landing.order_now.secondary_button"
              onClick={() => navigate({ to: "/features" })}
              className="btn-outline-gold px-8 py-4 rounded-full font-semibold text-base tracking-wide hover:scale-105 hover:brightness-110 active:scale-95 transition-all duration-200"
            >
              Order Now — ₹20,000
            </button>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-gold-400 font-sans text-sm tracking-widest uppercase mb-3">
            Why AIron
          </p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4">
            Precision Meets Intelligence
          </h2>
          <p className="text-silver-400 max-w-xl mx-auto text-lg">
            Every garment treated with the care it deserves, powered by
            cutting-edge technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "AI Fabric Detection",
              description:
                "Instantly identifies fabric type and automatically selects the optimal temperature, pressure, and steam profile for a perfect result.",
            },
            {
              icon: Droplets,
              title: "Precision Steam Control",
              description:
                "Variable steam output up to 120 g/min penetrates deep into fibers, eliminating even the most stubborn creases without damage.",
            },
            {
              icon: Shield,
              title: "Garment Protection",
              description:
                "Real-time thermal sensors and automatic shut-off ensure your clothes are never over-pressed or scorched.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-8 hover:border-gold-500 transition-colors duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-gold-400" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-silver-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Product Showcase */}
      <section className="py-16 px-4 bg-charcoal-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gold-400 font-sans text-sm tracking-widest uppercase mb-3">
              Engineered Excellence
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-5">
              Designed for the Modern Home
            </h2>
            <p className="text-silver-400 leading-relaxed mb-6">
              AIron's sleek, compact form factor fits seamlessly into any
              laundry room or wardrobe space. The intuitive touch interface and
              companion app make scheduling and monitoring effortless.
            </p>
            <ul className="space-y-3">
              {[
                "Compact 42 × 28 × 18 cm footprint",
                "Whisper-quiet operation at under 45 dB",
                "Wi-Fi & Bluetooth connectivity",
                "2-year comprehensive warranty",
              ].map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 text-silver-300 text-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-2 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl overflow-hidden">
            <img
              src="/assets/uploads/image-11-4.png"
              alt="AIron machine detail"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Lifestyle Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <img
          src="/assets/uploads/image-14-7.png"
          alt="AIron lifestyle"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-charcoal-950/60" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-5">
            Perfectly Pressed, Every Time
          </h2>
          <p className="text-silver-300 text-lg mb-8 leading-relaxed">
            From crisp dress shirts to delicate blouses, AIron handles every
            garment with professional-grade precision — so you always look your
            best.
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: "/features" })}
            className="btn-gold px-10 py-4 rounded-full font-semibold text-base tracking-wide hover:scale-105 active:scale-95 transition-all duration-200"
          >
            See All Features
          </button>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 max-w-2xl mx-auto text-center">
        <p className="text-gold-400 font-sans text-sm tracking-widest uppercase mb-3">
          Pricing
        </p>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
          One Price, Endless Convenience
        </h2>
        <p className="text-silver-400 mb-10">
          No subscriptions. No hidden fees. Just a one-time investment in
          effortless style.
        </p>

        <div className="bg-charcoal-900 border border-gold-500/40 rounded-3xl p-10 shadow-gold">
          <p className="text-silver-400 text-sm uppercase tracking-widest mb-2">
            AIron Pro
          </p>
          <p className="font-serif text-6xl font-bold text-white mb-1">
            ₹20,000
          </p>
          <p className="text-silver-500 text-sm mb-8">
            One-time purchase · Free shipping
          </p>

          <ul className="space-y-3 text-left mb-10 max-w-xs mx-auto">
            {[
              "AI fabric detection & auto-profiling",
              "Precision steam control system",
              "Smart connectivity (Wi-Fi + BT)",
              "2-year comprehensive warranty",
              "Free companion app",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-silver-300 text-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <button
            type="button"
            data-ocid="landing.pricing.order_now.primary_button"
            onClick={() => navigate({ to: "/features" })}
            className="btn-gold w-full py-4 rounded-xl font-semibold text-base tracking-wide hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Order Now
          </button>
        </div>
      </section>
    </div>
  );
}
