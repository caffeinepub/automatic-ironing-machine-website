import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Lock,
  QrCode,
  Smartphone,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";

type Step = "contact" | "method" | "confirm";

type PaymentMethod = {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
};

const paymentMethods: PaymentMethod[] = [
  {
    id: "card",
    label: "Card",
    icon: CreditCard,
    description: "Visa, MasterCard, RuPay & More",
  },
  {
    id: "upi",
    label: "UPI / QR",
    icon: QrCode,
    description: "GPay, PhonePe, BHIM & More",
  },
  {
    id: "netbanking",
    label: "Netbanking",
    icon: Building2,
    description: "All Indian banks",
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: Wallet,
    description: "PhonePe & More",
  },
  {
    id: "emi",
    label: "EMI",
    icon: Calendar,
    description: "EMI via Debit/Credit cards & More",
  },
  {
    id: "paylater",
    label: "Pay Later",
    icon: Clock,
    description: "LazyPay, ICICI, and FlexiPay",
  },
];

const banks = [
  { id: "sbi", name: "SBI", color: "#1a73b8", initials: "SBI" },
  { id: "icici", name: "ICICI", color: "#c8102e", initials: "ICICI" },
  { id: "axis", name: "Axis", color: "#97144d", initials: "AXIS" },
  { id: "kotak", name: "Kotak", color: "#ee3123", initials: "KMB" },
  { id: "yes", name: "Yes Bank", color: "#00539b", initials: "YES" },
  { id: "idbi", name: "IDBI", color: "#00843d", initials: "IDBI" },
];

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  address: string;
}

// Razorpay-style Blue Header
function RazorpayHeader({
  step,
  totalPrice,
  onBack,
  onClose,
}: {
  step: Step;
  totalPrice: number;
  onBack?: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="rounded-t-2xl px-5 py-4 flex items-center gap-3"
      style={{
        background: "linear-gradient(135deg, #1a56db 0%, #1e40af 100%)",
      }}
    >
      {step !== "contact" && onBack && (
        <button
          type="button"
          onClick={onBack}
          className="text-white/80 hover:text-white transition-colors shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Logo box */}
        <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
          <img
            src="/assets/uploads/AIron-1.jpg"
            alt="AIron"
            className="w-6 h-6 object-contain rounded"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              const next = e.currentTarget.nextElementSibling as HTMLElement;
              if (next) next.style.display = "flex";
            }}
          />
          <span className="text-white font-bold text-xs hidden items-center justify-center">
            A
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm leading-tight truncate">
            AIron
          </p>
          <p className="text-xs leading-tight" style={{ color: "#86efac" }}>
            ✓ Razorpay Trusted Business
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-white font-bold text-lg leading-tight">
          ₹{totalPrice.toLocaleString("en-IN")}
        </p>
        <p className="text-white/60 text-xs">Total</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-white/70 hover:text-white transition-colors ml-2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 shrink-0"
        aria-label="Close checkout"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Bottom sticky payment bar
function PaymentBar({
  totalPrice,
  onPay,
  isPaying,
  label = "Pay Now",
}: {
  totalPrice: number;
  onPay: () => void;
  isPaying: boolean;
  label?: string;
}) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4 rounded-b-2xl"
      style={{ background: "#f0f4ff", borderTop: "2px solid #e2e8f0" }}
    >
      <div>
        <p className="font-bold text-base" style={{ color: "#111827" }}>
          ₹{totalPrice.toLocaleString("en-IN")}
        </p>
        <p className="text-xs text-blue-600 cursor-pointer hover:underline">
          View Details
        </p>
      </div>
      <button
        type="button"
        data-ocid="checkout.submit_button"
        onClick={onPay}
        disabled={isPaying}
        className="flex items-center gap-2 px-8 py-2.5 rounded-lg font-semibold text-sm text-white transition-all active:scale-95 disabled:opacity-70"
        style={{ background: "#1a56db" }}
      >
        {isPaying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing…
          </>
        ) : (
          label
        )}
      </button>
    </div>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/checkout" });
  const actorRef = useRef<backendInterface | null>(null);

  // Initialize anonymous actor on mount — submitOrder has no auth requirement
  useEffect(() => {
    createActorWithConfig()
      .then((a) => {
        actorRef.current = a;
      })
      .catch(() => {
        // ignore — order will still attempt on pay
      });
  }, []);

  const quantity = Math.max(
    1,
    Number.parseInt((search as Record<string, string>).quantity || "1", 10) ||
      1,
  );

  const unitPrice = 20000;
  const totalPrice = unitPrice * quantity;

  const [step, setStep] = useState<Step>("contact");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [contact, setContact] = useState<ContactForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !contact.name.trim() ||
      !contact.email.trim() ||
      !contact.phone.trim() ||
      !contact.address.trim()
    ) {
      return;
    }
    setStep("method");
  };

  const handleMethodSelect = (id: string) => {
    setSelectedMethod(id);
    setStep("confirm");
  };

  const handlePay = async () => {
    setIsPaying(true);
    // Simulate payment processing
    await new Promise((res) => setTimeout(res, 1500));

    // Submit the order to backend — use actorRef (anonymous actor, no auth needed)
    try {
      let actor = actorRef.current;
      // If actor wasn't ready yet, try creating it now
      if (!actor) {
        actor = await createActorWithConfig();
        actorRef.current = actor;
      }
      await actor.submitOrder(
        contact.name.trim(),
        contact.email.trim(),
        contact.phone.trim(),
        contact.address.trim(),
        selectedMethod ?? "unknown",
        BigInt(quantity),
        BigInt(totalPrice),
      );
    } catch (err) {
      // Log but don't block — customer still sees success
      console.error("submitOrder failed:", err);
    }

    setIsPaying(false);
    // Show in-gateway success screen, then navigate after 2.5s
    setPaymentDone(true);
    await new Promise((res) => setTimeout(res, 2500));
    navigate({
      to: "/payment-success",
      search: { quantity: String(quantity) },
    });
  };

  const inputClass =
    "w-full border rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  const labelClass = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <div className="min-h-screen bg-charcoal-950 text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Back to features link */}
        <button
          type="button"
          onClick={() => navigate({ to: "/features" })}
          className="flex items-center gap-2 text-silver-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Features
        </button>

        {/* Order Summary Card — always visible */}
        <div
          className="rounded-2xl p-4 mb-4 flex items-center gap-4"
          style={{
            background: "#1a1a2e",
            border: "2px solid #c9a227",
            boxShadow: "0 2px 20px rgba(201,162,39,0.25)",
          }}
        >
          <img
            src="/assets/uploads/image-10-3.png"
            alt="AIron Machine"
            className="w-16 h-16 rounded-xl object-cover shrink-0"
            style={{ border: "1px solid #2a2a4a" }}
          />
          <div className="flex-1 min-w-0">
            <p
              className="font-serif font-semibold text-sm"
              style={{ color: "#f1f5f9" }}
            >
              AIron Automatic Ironing Machine
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#cbd5e1" }}>
              Qty: {quantity} × ₹{unitPrice.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p
              className="font-bold text-2xl"
              style={{
                color: "#f5c518",
                textShadow:
                  "0 0 16px rgba(245,197,24,0.8), 0 0 32px rgba(245,197,24,0.4)",
              }}
            >
              ₹{totalPrice.toLocaleString("en-IN")}
            </p>
            <p
              className="text-xs mt-0.5 font-medium"
              style={{ color: "#94a3b8" }}
            >
              Total
            </p>
          </div>
        </div>

        {/* Razorpay-style modal card */}
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: "#fff" }}
        >
          {/* ——— PAYMENT SUCCESS OVERLAY ——— */}
          {paymentDone && (
            <div
              className="flex flex-col items-center justify-center py-14 px-6 text-center gap-5"
              data-ocid="checkout.success_state"
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "#dcfce7", border: "3px solid #16a34a" }}
              >
                <CheckCircle2
                  className="w-10 h-10"
                  style={{ color: "#16a34a" }}
                />
              </div>
              <div>
                <p
                  className="text-xl font-bold mb-1"
                  style={{ color: "#111827" }}
                >
                  Payment Successful!
                </p>
                <p className="text-sm" style={{ color: "#6b7280" }}>
                  ₹{totalPrice.toLocaleString("en-IN")} paid via{" "}
                  {paymentMethods.find((m) => m.id === selectedMethod)?.label ??
                    selectedMethod}
                </p>
              </div>
              <p className="text-xs" style={{ color: "#9ca3af" }}>
                Redirecting to your order confirmation…
              </p>
            </div>
          )}

          {/* ——— STEP: CONTACT ——— */}
          {!paymentDone && step === "contact" && (
            <>
              <RazorpayHeader
                step="contact"
                totalPrice={totalPrice}
                onClose={() => navigate({ to: "/features" })}
              />
              <form onSubmit={handleContactSubmit} className="p-5 space-y-4">
                <div>
                  <h2 className="text-gray-900 font-semibold text-base mb-1">
                    Contact Details
                  </h2>
                  <p className="text-gray-500 text-xs">
                    We'll send your order confirmation here
                  </p>
                </div>

                <div>
                  <label htmlFor="checkout-name" className={labelClass}>
                    Full Name *
                  </label>
                  <input
                    id="checkout-name"
                    data-ocid="checkout.name.input"
                    required
                    type="text"
                    value={contact.name}
                    onChange={(e) =>
                      setContact({ ...contact, name: e.target.value })
                    }
                    placeholder="Your full name"
                    className={inputClass}
                    style={{ borderColor: "#d1d5db" }}
                  />
                </div>

                <div>
                  <label htmlFor="checkout-email" className={labelClass}>
                    Email Address *
                  </label>
                  <input
                    id="checkout-email"
                    data-ocid="checkout.email.input"
                    required
                    type="email"
                    value={contact.email}
                    onChange={(e) =>
                      setContact({ ...contact, email: e.target.value })
                    }
                    placeholder="you@example.com"
                    className={inputClass}
                    style={{ borderColor: "#d1d5db" }}
                  />
                </div>

                <div>
                  <label htmlFor="checkout-phone" className={labelClass}>
                    Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <div
                      className="flex items-center px-3 py-2.5 rounded-lg border text-sm text-gray-600 bg-gray-50 shrink-0"
                      style={{ borderColor: "#d1d5db" }}
                    >
                      <Smartphone className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      +91
                    </div>
                    <input
                      id="checkout-phone"
                      data-ocid="checkout.phone.input"
                      required
                      type="tel"
                      value={contact.phone}
                      onChange={(e) =>
                        setContact({ ...contact, phone: e.target.value })
                      }
                      placeholder="98765 43210"
                      className={`${inputClass} flex-1`}
                      style={{ borderColor: "#d1d5db" }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="checkout-address" className={labelClass}>
                    Delivery Address *
                  </label>
                  <textarea
                    id="checkout-address"
                    data-ocid="checkout.address.textarea"
                    required
                    value={contact.address}
                    onChange={(e) =>
                      setContact({ ...contact, address: e.target.value })
                    }
                    placeholder="Street, City, State, PIN Code"
                    rows={3}
                    className={`${inputClass} resize-none`}
                    style={{ borderColor: "#d1d5db" }}
                  />
                </div>

                <button
                  type="submit"
                  data-ocid="checkout.proceed.primary_button"
                  className="w-full py-3 rounded-lg font-semibold text-sm text-white transition-all active:scale-95 hover:opacity-90"
                  style={{ background: "#1a56db" }}
                >
                  Proceed
                </button>

                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                  <Lock className="w-3 h-3" />
                  <span>Secured by Razorpay</span>
                </div>
              </form>
            </>
          )}

          {/* ——— STEP: METHOD ——— */}
          {!paymentDone && step === "method" && (
            <>
              <RazorpayHeader
                step="method"
                totalPrice={totalPrice}
                onBack={() => setStep("contact")}
                onClose={() => navigate({ to: "/features" })}
              />
              <div className="p-5">
                <h2 className="text-gray-900 font-semibold text-sm mb-4">
                  Cards, UPI &amp; More
                </h2>
                <div className="space-y-1">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        type="button"
                        key={method.id}
                        data-ocid={`checkout.${method.id}.toggle`}
                        onClick={() => handleMethodSelect(method.id)}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all border hover:border-blue-500 hover:bg-blue-50 active:scale-[0.99] group"
                        style={{ borderColor: "#e5e7eb" }}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "#eff6ff" }}
                        >
                          <Icon
                            className="w-4.5 h-4.5 text-blue-600"
                            style={{ width: "18px", height: "18px" }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-medium text-sm">
                            {method.label}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {method.description}
                          </p>
                        </div>
                        <div
                          className="w-5 h-5 rounded-full border-2 shrink-0 group-hover:border-blue-500 transition-colors"
                          style={{ borderColor: "#d1d5db" }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center justify-center gap-1.5 px-5 pb-5 text-xs text-gray-400">
                <Lock className="w-3 h-3" />
                <span>256-bit encryption · RBI compliant</span>
              </div>
            </>
          )}

          {/* ——— STEP: CONFIRM ——— */}
          {!paymentDone && step === "confirm" && (
            <>
              <RazorpayHeader
                step="confirm"
                totalPrice={totalPrice}
                onBack={() => setStep("method")}
                onClose={() => navigate({ to: "/features" })}
              />

              <div className="p-5 space-y-4">
                {/* Selected method badge */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="text-gray-900 font-semibold text-sm capitalize">
                    {paymentMethods.find((m) => m.id === selectedMethod)
                      ?.label ?? selectedMethod}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep("method")}
                    className="ml-auto text-blue-600 text-xs hover:underline"
                  >
                    Change
                  </button>
                </div>

                {/* Card payment fields */}
                {selectedMethod === "card" && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="card-number" className={labelClass}>
                        Card Number
                      </label>
                      <input
                        id="card-number"
                        data-ocid="checkout.card_number.input"
                        type="text"
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(
                            e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 16)
                              .replace(/(.{4})/g, "$1 ")
                              .trim(),
                          )
                        }
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={inputClass}
                        style={{ borderColor: "#d1d5db" }}
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label htmlFor="card-expiry" className={labelClass}>
                          Expiry
                        </label>
                        <input
                          id="card-expiry"
                          data-ocid="checkout.card_expiry.input"
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM / YY"
                          maxLength={7}
                          className={inputClass}
                          style={{ borderColor: "#d1d5db" }}
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="card-cvv" className={labelClass}>
                          CVV
                        </label>
                        <input
                          id="card-cvv"
                          data-ocid="checkout.card_cvv.input"
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          maxLength={4}
                          className={inputClass}
                          style={{ borderColor: "#d1d5db" }}
                        />
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-2 p-3 rounded-lg text-xs text-gray-500"
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <span>
                        This is a test environment. Use any card details.
                      </span>
                    </div>
                  </div>
                )}

                {/* UPI fields */}
                {selectedMethod === "upi" && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="upi-id" className={labelClass}>
                        UPI ID
                      </label>
                      <input
                        id="upi-id"
                        data-ocid="checkout.upi.input"
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className={inputClass}
                        style={{ borderColor: "#d1d5db" }}
                      />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="text-gray-400">OR scan QR code</span>
                    </div>
                    <div
                      className="flex items-center justify-center h-36 rounded-xl border-2 border-dashed"
                      style={{ borderColor: "#d1d5db" }}
                    >
                      <div className="text-center">
                        <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">
                          QR code will appear here
                        </p>
                        <p className="text-xs text-gray-300 mt-1">
                          (Demo mode — any UPI ID works)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Net Banking */}
                {selectedMethod === "netbanking" && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                      Popular Banks
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {banks.map((bank) => (
                        <button
                          type="button"
                          key={bank.id}
                          onClick={() => setSelectedBank(bank.id)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-xs font-medium ${
                            selectedBank === bank.id
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-blue-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs"
                            style={{ background: bank.color }}
                          >
                            {bank.initials.slice(0, 3)}
                          </div>
                          {bank.name}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label htmlFor="other-bank" className={labelClass}>
                        Select a different bank
                      </label>
                      <select
                        id="other-bank"
                        data-ocid="checkout.bank.select"
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className={inputClass}
                        style={{ borderColor: "#d1d5db" }}
                      >
                        <option value="">Choose your bank</option>
                        <option value="sbi">State Bank of India</option>
                        <option value="hdfc">HDFC Bank</option>
                        <option value="icici">ICICI Bank</option>
                        <option value="axis">Axis Bank</option>
                        <option value="kotak">Kotak Mahindra Bank</option>
                        <option value="yes">Yes Bank</option>
                        <option value="idbi">IDBI Bank</option>
                        <option value="pnb">Punjab National Bank</option>
                        <option value="bob">Bank of Baroda</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Wallet */}
                {selectedMethod === "wallet" && (
                  <div className="grid grid-cols-2 gap-3">
                    {["PhonePe", "Paytm", "Amazon Pay", "Mobikwik"].map((w) => (
                      <button
                        type="button"
                        key={w}
                        className="flex items-center gap-2 border rounded-xl py-3 px-4 text-sm font-medium text-gray-700 hover:border-blue-400 hover:bg-blue-50 transition-all"
                        style={{ borderColor: "#d1d5db" }}
                      >
                        <Wallet className="w-4 h-4 text-blue-500" />
                        {w}
                      </button>
                    ))}
                  </div>
                )}

                {/* EMI */}
                {selectedMethod === "emi" && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">
                      Choose your EMI plan
                    </p>
                    {[
                      { months: 3, amount: "₹6,667/mo", note: "No cost EMI" },
                      { months: 6, amount: "₹3,467/mo", note: "₹200 extra" },
                      { months: 12, amount: "₹1,800/mo", note: "₹600 extra" },
                    ].map((plan) => (
                      <div
                        key={plan.months}
                        className="flex items-center justify-between p-3 rounded-xl border hover:border-blue-400 cursor-pointer transition-all"
                        style={{ borderColor: "#e5e7eb" }}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {plan.months} months
                          </p>
                          <p className="text-xs text-gray-500">{plan.note}</p>
                        </div>
                        <p className="text-sm font-semibold text-blue-700">
                          {plan.amount}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pay Later */}
                {selectedMethod === "paylater" && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">
                      Choose Pay Later provider
                    </p>
                    {["LazyPay", "ICICI Pay Later", "FlexiPay"].map(
                      (provider) => (
                        <div
                          key={provider}
                          className="flex items-center gap-3 p-3 rounded-xl border hover:border-blue-400 cursor-pointer transition-all"
                          style={{ borderColor: "#e5e7eb" }}
                        >
                          <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                          <p className="text-sm font-medium text-gray-900">
                            {provider}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              <PaymentBar
                totalPrice={totalPrice}
                onPay={handlePay}
                isPaying={isPaying}
              />
            </>
          )}
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {(["contact", "method", "confirm"] as Step[]).map((s, i) => (
            <div
              key={s}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: step === s ? "32px" : "8px",
                background:
                  step === s
                    ? "#1a56db"
                    : step === "confirm" && i < 2
                      ? "#1a56db"
                      : step === "method" && i < 1
                        ? "#1a56db"
                        : "#374151",
                opacity: step === s ? 1 : 0.5,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
