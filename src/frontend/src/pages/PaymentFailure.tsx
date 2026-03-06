import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, HelpCircle, RefreshCw, XCircle } from "lucide-react";

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 md:py-16"
      style={{ background: "oklch(0.08 0.008 260)" }}
    >
      <div className="max-w-2xl w-full text-center space-y-8 md:space-y-10">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div
            className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center border-2 border-destructive/40"
            style={{ background: "oklch(0.577 0.245 27.325 / 0.1)" }}
          >
            <XCircle
              size={40}
              className="md:hidden"
              style={{ color: "oklch(0.704 0.191 22.216)" }}
            />
            <XCircle
              size={48}
              className="hidden md:block"
              style={{ color: "oklch(0.704 0.191 22.216)" }}
            />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: "oklch(0.704 0.191 22.216)" }}
          >
            Payment Cancelled
          </p>
          <h1
            className="font-serif text-3xl md:text-5xl font-bold"
            style={{ color: "oklch(0.96 0.005 85)" }}
          >
            Payment Not Completed
          </h1>
          <div
            className="w-16 h-px mx-auto"
            style={{ background: "oklch(0.704 0.191 22.216)" }}
          />
          <p
            className="text-base md:text-lg leading-relaxed px-2"
            style={{ color: "oklch(0.6 0.005 260)" }}
          >
            Your payment was not completed. No charges have been made to your
            account. You can try again or return to browse our product.
          </p>
        </div>

        {/* Reasons */}
        <div
          className="border border-border/30 p-5 md:p-8 text-left space-y-4"
          style={{ background: "oklch(0.12 0.01 260)" }}
        >
          <div className="flex items-center gap-2">
            <HelpCircle size={16} className="gold-text" />
            <h3
              className="font-serif text-sm md:text-base font-semibold"
              style={{ color: "oklch(0.96 0.005 85)" }}
            >
              Common Reasons
            </h3>
          </div>
          <ul className="space-y-2">
            {[
              "Payment was cancelled by the user",
              "Card was declined by the issuing bank",
              "Insufficient funds on the card",
              "Session timed out during checkout",
            ].map((reason) => (
              <li key={reason} className="flex items-center gap-2">
                <div
                  className="w-1 h-1 rounded-full shrink-0"
                  style={{ background: "oklch(0.6 0.005 260)" }}
                />
                <span
                  className="text-sm"
                  style={{ color: "oklch(0.6 0.005 260)" }}
                >
                  {reason}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={() =>
              navigate({ to: "/checkout", search: { quantity: "1" } })
            }
            className="btn-gold flex items-center justify-center gap-3 py-4 px-8 md:px-10 min-h-[52px]"
          >
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/features" })}
            className="btn-outline-gold flex items-center justify-center gap-3 py-4 px-8 md:px-10 min-h-[52px]"
          >
            <ArrowLeft size={16} />
            <span>Back to Features</span>
          </button>
        </div>

        <p className="text-xs" style={{ color: "oklch(0.45 0.005 260)" }}>
          Need help? Contact our support team at{" "}
          <span className="gold-text">support@airon.in</span>
        </p>
      </div>
    </div>
  );
}
