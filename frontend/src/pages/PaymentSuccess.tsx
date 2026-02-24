import { useNavigate, useSearch } from '@tanstack/react-router';
import { CheckCircle2, ArrowRight, Package, Mail, Phone } from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/payment-success' });
  const quantity = Math.max(1, parseInt((search as Record<string, string>).quantity || '1', 10) || 1);

  const unitPrice = 20000;
  const totalPrice = unitPrice * quantity;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 md:py-16"
      style={{ background: 'oklch(0.08 0.008 260)' }}>
      <div className="max-w-2xl w-full text-center space-y-8 md:space-y-10">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center border-2 border-gold/40"
            style={{ background: 'oklch(0.72 0.12 75 / 0.1)' }}>
            <CheckCircle2 size={40} className="gold-text md:hidden" />
            <CheckCircle2 size={48} className="gold-text hidden md:block" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <p className="text-xs tracking-widest uppercase gold-text">Order Confirmed</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold"
            style={{ color: 'oklch(0.96 0.005 85)' }}>
            Thank You!
          </h1>
          <div className="section-divider" />
          <p className="text-base md:text-lg leading-relaxed px-2"
            style={{ color: 'oklch(0.6 0.005 260)' }}>
            Your AIron Automatic Ironing Machine{quantity > 1 ? ` (×${quantity})` : ''} has been ordered successfully.
            You'll receive a confirmation email shortly with your order details and tracking information.
          </p>
        </div>

        {/* Order Details */}
        <div className="border border-border/30 p-5 md:p-8 text-left space-y-6"
          style={{ background: 'oklch(0.12 0.01 260)' }}>
          <h3 className="font-serif text-base md:text-lg font-semibold"
            style={{ color: 'oklch(0.96 0.005 85)' }}>What Happens Next</h3>
          <div className="space-y-4">
            {[
              {
                icon: Mail,
                title: 'Confirmation Email',
                desc: 'A detailed receipt and order confirmation will be sent to your email within minutes.',
              },
              {
                icon: Package,
                title: 'Processing & Shipping',
                desc: 'Your AIron will be carefully packaged and dispatched within 1–2 business days.',
              },
              {
                icon: Phone,
                title: 'Delivery & Setup',
                desc: 'Expect delivery within 3–5 business days. Our team will contact you to schedule setup.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3 md:gap-4">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 border border-gold/30"
                  style={{ background: 'oklch(0.72 0.12 75 / 0.1)' }}>
                  <Icon size={14} className="gold-text" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium" style={{ color: 'oklch(0.85 0.005 260)' }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'oklch(0.55 0.005 260)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Summary */}
        <div className="flex items-center gap-4 md:gap-6 border border-border/20 p-4 md:p-6"
          style={{ background: 'oklch(0.1 0.008 260)' }}>
          <img
            src="/assets/generated/ironing-machine-hero.dim_1400x800.png"
            alt="AIron"
            className="w-16 h-12 md:w-20 md:h-14 object-cover shrink-0"
          />
          <div className="flex-1 text-left min-w-0">
            <p className="font-serif text-sm md:text-base font-semibold truncate"
              style={{ color: 'oklch(0.96 0.005 85)' }}>
              AIron Automatic Ironing Machine
            </p>
            <p className="text-xs mt-1" style={{ color: 'oklch(0.55 0.005 260)' }}>
              Qty: {quantity} × ₹{unitPrice.toLocaleString('en-IN')}
            </p>
          </div>
          <span className="font-serif text-lg md:text-xl font-bold gold-text shrink-0">
            ₹{totalPrice.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate({ to: '/product' })}
            className="btn-gold flex items-center justify-center gap-3 py-4 px-8 md:px-10 min-h-[52px]"
          >
            <span>Back to Home</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
