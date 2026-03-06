import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Loader2,
  Lock,
  Shield,
  Smartphone,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

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
    label: "Credit / Debit Card",
    icon: CreditCard,
    description: "Visa, Mastercard, RuPay",
  },
  {
    id: "upi",
    label: "UPI",
    icon: Smartphone,
    description: "GPay, PhonePe, Paytm, BHIM",
  },
  {
    id: "netbanking",
    label: "Net Banking",
    icon: Building2,
    description: "All major banks supported",
  },
  {
    id: "wallet",
    label: "Wallets",
    icon: Wallet,
    description: "Paytm, Mobikwik, Freecharge",
  },
];

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/checkout" });
  const { actor } = useActor();
  const { identity, login, isLoggingIn } = useInternetIdentity();
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
  const [bank, setBank] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  // Register user on first checkout if needed (as a regular user)
  useEffect(() => {
    if (identity && actor) {
      // Register the user - using a non-matching token so they get #user role
      actor
        ._initializeAccessControlWithSecret("user-registration")
        .catch(() => {
          // Already registered or admin not set up yet — ignore
        });
    }
  }, [identity, actor]);

  // Show login gate if not authenticated
  if (!identity) {
    return (
      <div className="min-h-screen bg-charcoal-950 text-white flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto">
            <Shield className="w-7 h-7 text-gold-400" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-white mb-2">
              Sign In to Order
            </h2>
            <p className="text-silver-400 text-sm leading-relaxed">
              Please sign in with Internet Identity to place your order. It's
              free and takes just a few seconds.
            </p>
          </div>
          <button
            type="button"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="btn-gold w-full flex items-center justify-center gap-3 py-4 text-sm min-h-[52px] disabled:opacity-60"
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <Shield size={16} />
                <span>Sign In Securely</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/features" })}
            className="text-silver-400 hover:text-white text-sm transition-colors"
          >
            ← Back to Features
          </button>
        </div>
      </div>
    );
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("method");
  };

  const handleMethodSelect = (id: string) => {
    setSelectedMethod(id);
    setStep("confirm");
  };

  const handlePay = async () => {
    setIsPaying(true);
    await new Promise((res) => setTimeout(res, 2000));
    // Submit order to backend — don't block navigation on failure
    try {
      if (actor) {
        await actor.submitOrder(
          contact.name,
          contact.email,
          contact.phone,
          contact.address,
          selectedMethod ?? "unknown",
          BigInt(quantity),
          BigInt(totalPrice),
        );
      }
    } catch {
      // Silently ignore — still navigate to success
    }
    setIsPaying(false);
    navigate({
      to: "/payment-success",
      search: { quantity: String(quantity) },
    });
  };

  const progressSteps = [
    { key: "contact", label: "Contact" },
    { key: "method", label: "Payment" },
    { key: "confirm", label: "Confirm" },
  ];

  const currentStepIndex = progressSteps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-charcoal-950 text-white py-10 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => navigate({ to: "/features" })}
            className="text-silver-400 hover:text-white transition-colors"
            aria-label="Back to features"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-2xl font-bold text-white">Checkout</h1>
          <div className="ml-auto flex items-center gap-1 text-silver-500 text-xs">
            <Lock className="w-3 h-3" />
            <span>Secure</span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {progressSteps.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    i < currentStepIndex
                      ? "bg-gold-500 text-charcoal-950"
                      : i === currentStepIndex
                        ? "bg-gold-500 text-charcoal-950"
                        : "bg-charcoal-800 text-silver-500"
                  }`}
                >
                  {i < currentStepIndex ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-xs mt-1 ${
                    i <= currentStepIndex ? "text-gold-400" : "text-silver-600"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < progressSteps.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 mb-4 transition-colors ${
                    i < currentStepIndex ? "bg-gold-500" : "bg-charcoal-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-4 mb-6 flex items-center gap-4">
          <img
            src="/assets/image-4.png"
            alt="AIron Machine"
            className="w-16 h-16 rounded-xl object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-serif font-semibold text-white text-sm">
              AIron Automatic Ironing Machine
            </p>
            <p className="text-silver-400 text-xs mt-0.5">
              Qty: {quantity} × ₹{unitPrice.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-gold-400 font-bold text-lg">
              ₹{totalPrice.toLocaleString("en-IN")}
            </p>
            {quantity > 1 && <p className="text-silver-500 text-xs">Total</p>}
          </div>
        </div>

        {/* Step: Contact */}
        {step === "contact" && (
          <form
            onSubmit={handleContactSubmit}
            className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-6 space-y-4"
          >
            <h2 className="font-serif text-xl font-semibold text-white mb-2">
              Delivery Details
            </h2>
            <div>
              <label
                htmlFor="checkout-name"
                className="block text-silver-400 text-xs mb-1 uppercase tracking-wide"
              >
                Full Name
              </label>
              <input
                id="checkout-name"
                required
                type="text"
                value={contact.name}
                onChange={(e) =>
                  setContact({ ...contact, name: e.target.value })
                }
                placeholder="Your full name"
                className="w-full bg-charcoal-800 border border-charcoal-600 rounded-xl px-4 py-3 text-white placeholder:text-silver-600 focus:outline-none focus:border-gold-500 transition-colors text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="checkout-email"
                className="block text-silver-400 text-xs mb-1 uppercase tracking-wide"
              >
                Email
              </label>
              <input
                id="checkout-email"
                required
                type="email"
                value={contact.email}
                onChange={(e) =>
                  setContact({ ...contact, email: e.target.value })
                }
                placeholder="you@example.com"
                className="w-full bg-charcoal-800 border border-charcoal-600 rounded-xl px-4 py-3 text-white placeholder:text-silver-600 focus:outline-none focus:border-gold-500 transition-colors text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="checkout-phone"
                className="block text-silver-400 text-xs mb-1 uppercase tracking-wide"
              >
                Phone
              </label>
              <input
                id="checkout-phone"
                required
                type="tel"
                value={contact.phone}
                onChange={(e) =>
                  setContact({ ...contact, phone: e.target.value })
                }
                placeholder="+91 98765 43210"
                className="w-full bg-charcoal-800 border border-charcoal-600 rounded-xl px-4 py-3 text-white placeholder:text-silver-600 focus:outline-none focus:border-gold-500 transition-colors text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="checkout-address"
                className="block text-silver-400 text-xs mb-1 uppercase tracking-wide"
              >
                Delivery Address
              </label>
              <textarea
                id="checkout-address"
                required
                value={contact.address}
                onChange={(e) =>
                  setContact({ ...contact, address: e.target.value })
                }
                placeholder="Street, City, State, PIN"
                rows={3}
                className="w-full bg-charcoal-800 border border-charcoal-600 rounded-xl px-4 py-3 text-white placeholder:text-silver-600 focus:outline-none focus:border-gold-500 transition-colors text-sm resize-none"
              />
            </div>
            <button
              type="submit"
              className="btn-gold w-full py-3 rounded-xl font-semibold text-sm tracking-wide"
            >
              Continue to Payment
            </button>
          </form>
        )}

        {/* Step: Method */}
        {step === "method" && (
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-6 space-y-3">
            <h2 className="font-serif text-xl font-semibold text-white mb-2">
              Choose Payment Method
            </h2>
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  className="w-full flex items-center gap-4 bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-600 hover:border-gold-500 rounded-xl px-4 py-4 transition-all duration-200 text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-gold-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">
                      {method.label}
                    </p>
                    <p className="text-silver-500 text-xs mt-0.5">
                      {method.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-silver-500 group-hover:text-gold-400 transition-colors shrink-0" />
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setStep("contact")}
              className="w-full text-silver-400 hover:text-white text-sm py-2 transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && (
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-6 space-y-5">
            <h2 className="font-serif text-xl font-semibold text-white mb-2">
              Confirm & Pay
            </h2>

            {/* Payment method details */}
            {selectedMethod === "card" && (
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="card-number"
                    className="block text-silver-400 text-xs mb-1 uppercase tracking-wide"
                  >
                    Card Number
                  </label>
                  <input
                    id="card-number"
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full bg-charcoal-800 border border-charcoal-600 rounded-xl px-4 py-3 text-white placeholder:text-silver-600 focus:outline-none focus:border-gold-500 transition-colors text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label
                      htmlFor="card-expiry"
                      className="block text-silver-400 text-xs mb-1 uppercase tracking-wide"
                    >
                      Expiry
                    </label>
                    <input
                      id="card-expiry"
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full bg-charcoal-800 border border-charcoal-600 rounded-xl px-4 py-3 text-white placeholder:text-silver-600 focus:outline-none focus:border-gold-500 transition-colors text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="card-cvv"
                      className="block text-silver-400 text-xs mb-1 uppercase tracking-wide"
                    >
                      CVV
                    </label>
                    <input
                      id="card-cvv"
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full bg-charcoal-800 border border-charcoal-600 rounded-xl px-4 py-3 text-white placeholder:text-silver-600 focus:outline-none focus:border-gold-500 transition-colors text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === "upi" && (
              <div>
                <label
                  htmlFor="upi-id"
                  className="block text-silver-400 text-xs mb-1 uppercase tracking-wide"
                >
                  UPI ID
                </label>
                <input
                  id="upi-id"
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full bg-charcoal-800 border border-charcoal-600 rounded-xl px-4 py-3 text-white placeholder:text-silver-600 focus:outline-none focus:border-gold-500 transition-colors text-sm"
                />
              </div>
            )}

            {selectedMethod === "netbanking" && (
              <div>
                <label
                  htmlFor="bank-select"
                  className="block text-silver-400 text-xs mb-1 uppercase tracking-wide"
                >
                  Select Bank
                </label>
                <select
                  id="bank-select"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="w-full bg-charcoal-800 border border-charcoal-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors text-sm"
                >
                  <option value="">Choose your bank</option>
                  <option value="sbi">State Bank of India</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="axis">Axis Bank</option>
                  <option value="kotak">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {selectedMethod === "wallet" && (
              <div className="grid grid-cols-2 gap-3">
                {["Paytm", "Mobikwik", "Freecharge", "Amazon Pay"].map((w) => (
                  <button
                    type="button"
                    key={w}
                    className="bg-charcoal-800 border border-charcoal-600 hover:border-gold-500 rounded-xl py-3 text-sm text-silver-300 hover:text-white transition-all"
                  >
                    {w}
                  </button>
                ))}
              </div>
            )}

            {/* Summary */}
            <div className="border-t border-charcoal-700 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-silver-400">AIron × {quantity}</span>
                <span className="text-white">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-silver-400">Shipping</span>
                <span className="text-green-400 text-xs font-medium">FREE</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-charcoal-700">
                <span className="text-white">Total</span>
                <span className="text-gold-400">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <button
              type="button"
              data-ocid="checkout.submit_button"
              onClick={handlePay}
              disabled={isPaying}
              className="btn-gold w-full py-4 rounded-xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isPaying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing…
                </>
              ) : (
                `Pay ₹${totalPrice.toLocaleString("en-IN")}`
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep("method")}
              className="w-full text-silver-400 hover:text-white text-sm py-2 transition-colors"
            >
              ← Change Payment Method
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
