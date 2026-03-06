import { useNavigate } from "@tanstack/react-router";
import {
  Droplets,
  Eye,
  Minus,
  Plus,
  Shield,
  Wifi,
  Wind,
  Zap,
} from "lucide-react";
import { useState } from "react";

const features = [
  {
    icon: Zap,
    title: "AI-Powered Precision",
    description:
      "Advanced machine learning algorithms detect fabric type and adjust temperature, pressure, and steam levels automatically for a perfect press every time.",
    image: "/assets/uploads/image-10-3.png",
  },
  {
    icon: Droplets,
    title: "Smart Steam Technology",
    description:
      "Precision-controlled steam injection penetrates deep into fabric fibers, eliminating stubborn wrinkles without damaging delicate materials.",
    image: "/assets/uploads/image-13-6.png",
  },
  {
    icon: Eye,
    title: "Fabric Recognition",
    description:
      "Multi-sensor array identifies over 50 fabric types — from delicate silk to heavy denim — and applies the optimal ironing profile automatically.",
    image: "/assets/uploads/image-11-4.png",
  },
  {
    icon: Wind,
    title: "Rapid Dry System",
    description:
      "Integrated hot-air circulation dries and irons simultaneously, reducing total garment processing time by up to 60% compared to traditional methods. Also perfect for drying shoes quickly and efficiently.",
    image: "/assets/uploads/image-12-5.png",
  },
  {
    icon: Shield,
    title: "Garment Protection",
    description:
      "Real-time thermal monitoring and automatic shut-off safeguards prevent scorching or over-pressing, keeping your wardrobe in pristine condition.",
    image: "/assets/uploads/image-9-2.png",
  },
  {
    icon: Wifi,
    title: "Smart Connectivity",
    description:
      "Wi-Fi and Bluetooth enabled for remote scheduling, maintenance alerts, and firmware updates via the AIron companion app.",
    image: "/assets/uploads/image-14-7.png",
  },
];

const specs = [
  { label: "Power Consumption", value: "1800W" },
  { label: "Steam Output", value: "120 g/min" },
  { label: "Temperature Range", value: "80°C – 220°C" },
  { label: "Fabric Profiles", value: "50+ types" },
  { label: "Tank Capacity", value: "350 ml" },
  { label: "Processing Time", value: "< 90 sec/garment" },
  { label: "Connectivity", value: "Wi-Fi 6 + BT 5.2" },
  { label: "Dimensions", value: "42 × 28 × 18 cm" },
  { label: "Weight", value: "4.2 kg" },
  { label: "Warranty", value: "2 Years" },
];

export default function FeaturesPage() {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const unitPrice = 20000;
  const totalPrice = unitPrice * quantity;

  const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1));
  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number.parseInt(e.target.value, 10);
    if (!Number.isNaN(val) && val >= 1) setQuantity(val);
    else if (e.target.value === "") setQuantity(1);
  };

  const handleOrderNow = () => {
    navigate({ to: "/checkout", search: { quantity: String(quantity) } });
  };

  return (
    <div className="min-h-screen bg-charcoal-950 text-white">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <img
          src="/assets/uploads/image-13-6.png"
          alt="AIron Machine"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <p className="text-gold-400 font-sans text-sm tracking-widest uppercase mb-3">
            Full Specifications
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-4">
            Every Feature, Perfected
          </h1>
          <p className="text-silver-300 text-lg md:text-xl leading-relaxed">
            Discover the engineering excellence behind AIron's intelligent
            ironing system.
          </p>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
            Intelligent Features
          </h2>
          <p className="text-silver-400 max-w-xl mx-auto">
            Six core technologies working in harmony to deliver a flawless
            result.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-charcoal-900 border border-charcoal-700 rounded-2xl overflow-hidden hover:border-gold-500 transition-colors duration-300"
              >
                {feature.image && (
                  <div className="h-44 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover opacity-80"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-gold-400" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-silver-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Technical Specs */}
      <section className="py-16 px-4 bg-charcoal-900">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
              Technical Specifications
            </h2>
            <p className="text-silver-400">
              Built to professional standards, designed for everyday use.
            </p>
          </div>

          <div className="divide-y divide-charcoal-700">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex justify-between items-center py-4 px-2"
              >
                <span className="text-silver-400 font-sans text-sm">
                  {spec.label}
                </span>
                <span className="text-white font-semibold text-sm">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lifestyle Strip */}
      <section className="relative py-24 px-4 overflow-hidden">
        <img
          src="/assets/uploads/image-14-7.png"
          alt="AIron lifestyle"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4">
            Ready to Elevate Your Wardrobe?
          </h2>
          <p className="text-silver-300 text-lg mb-10">
            Join thousands of professionals who trust AIron for a perfectly
            pressed look, every day.
          </p>

          {/* Quantity Selector */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <p className="text-silver-300 font-sans text-sm tracking-wide uppercase">
              Select Quantity
            </p>
            <div className="flex items-center gap-0 bg-charcoal-900 border border-charcoal-700 rounded-full overflow-hidden">
              <button
                type="button"
                onClick={handleDecrement}
                aria-label="Decrease quantity"
                className="w-12 h-12 flex items-center justify-center text-gold-400 hover:bg-charcoal-800 transition-colors touch-manipulation"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={handleInputChange}
                className="w-16 h-12 text-center bg-transparent text-white font-semibold text-lg focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={handleIncrement}
                aria-label="Increase quantity"
                className="w-12 h-12 flex items-center justify-center text-gold-400 hover:bg-charcoal-800 transition-colors touch-manipulation"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-silver-400 text-sm">
              ₹{unitPrice.toLocaleString("en-IN")} × {quantity} ={" "}
              <span className="text-gold-400 font-semibold">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </p>
          </div>

          {/* Order Now Button */}
          <button
            type="button"
            data-ocid="features.order_now.primary_button"
            onClick={handleOrderNow}
            className="btn-gold text-base px-10 py-4 rounded-full font-semibold tracking-wide hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Order Now — ₹{totalPrice.toLocaleString("en-IN")}
          </button>
        </div>
      </section>
    </div>
  );
}
