import { Principal } from "@dfinity/principal";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Info, Loader2, Shield, ShieldCheck, UserCog } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../../backend";
import { useActor } from "../../hooks/useActor";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

export default function AdminSettingsPage() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const navigate = useNavigate();
  const [principalInput, setPrincipalInput] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [principalError, setPrincipalError] = useState("");

  const adminQuery = useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });

  useEffect(() => {
    if (!identity && !adminQuery.isLoading) {
      void navigate({ to: "/admin/login" });
    }
  }, [identity, adminQuery.isLoading, navigate]);

  useEffect(() => {
    if (adminQuery.isFetched && adminQuery.data === false) {
      void navigate({ to: "/admin/login" });
    }
  }, [adminQuery.isFetched, adminQuery.data, navigate]);

  const ownPrincipal = identity?.getPrincipal().toString() ?? "";

  const validatePrincipal = (value: string): boolean => {
    if (!value.trim()) {
      setPrincipalError("Please enter a Principal ID.");
      return false;
    }
    try {
      Principal.fromText(value.trim());
      setPrincipalError("");
      return true;
    } catch {
      setPrincipalError("Invalid Principal ID format. Check and try again.");
      return false;
    }
  };

  const handleAssignAdmin = async () => {
    if (!actor) return;
    if (!validatePrincipal(principalInput)) return;

    setIsAssigning(true);
    try {
      const principal = Principal.fromText(principalInput.trim());
      await actor.assignCallerUserRole(principal, UserRole.admin);
      toast.success(
        `Admin role assigned to ${principalInput.trim().slice(0, 12)}…`,
        {
          description: "The user now has administrator access.",
        },
      );
      setPrincipalInput("");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error("Failed to assign admin role", {
        description: error?.message ?? "An unexpected error occurred.",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  if (adminQuery.isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-64"
        data-ocid="admin.settings.loading_state"
      >
        <Loader2
          size={24}
          className="animate-spin"
          style={{ color: "#6366f1" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl" data-ocid="admin.settings.page">
      {/* Page header */}
      <div>
        <h2 className="text-lg font-semibold" style={{ color: "#e2e8f0" }}>
          Settings
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
          Manage admin roles and panel configuration
        </p>
      </div>

      {/* Your Account card */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#1a1a35", border: "1px solid #2a2a4a" }}
        data-ocid="admin.settings.card"
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "#6366f115" }}
          >
            <ShieldCheck size={16} style={{ color: "#6366f1" }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
            Your Account
          </h3>
        </div>
        <div
          className="rounded-lg p-4"
          style={{ background: "#0d0d1a", border: "1px solid #1e1e3f" }}
        >
          <p className="text-xs mb-1" style={{ color: "#64748b" }}>
            Logged-in Principal ID
          </p>
          <p
            className="text-sm font-mono break-all"
            style={{ color: "#e2e8f0" }}
          >
            {ownPrincipal || "—"}
          </p>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span
            className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
            style={{ background: "#10b98115", color: "#34d399" }}
          >
            <Shield size={11} />
            Administrator
          </span>
        </div>
      </div>

      {/* Assign Admin Role card */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#1a1a35", border: "1px solid #2a2a4a" }}
        data-ocid="admin.settings.card"
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "#a855f715" }}
          >
            <UserCog size={16} style={{ color: "#a855f7" }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
            Assign Admin Role
          </h3>
        </div>

        {/* Info note */}
        <div
          className="rounded-lg p-3.5 mb-4 flex items-start gap-2.5"
          style={{ background: "#6366f10d", border: "1px solid #6366f120" }}
        >
          <Info
            size={14}
            className="shrink-0 mt-0.5"
            style={{ color: "#818cf8" }}
          />
          <div>
            <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
              To grant admin access to another user, ask them to log into the
              AIron website and copy their{" "}
              <strong style={{ color: "#e2e8f0" }}>
                Internet Identity Principal ID
              </strong>{" "}
              (visible on their profile or in the browser console via{" "}
              <code
                className="px-1 rounded text-xs"
                style={{ background: "#1e1e3f", color: "#818cf8" }}
              >
                identity.getPrincipal().toString()
              </code>
              ). Paste it below and click "Assign Admin".
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-3">
          <div>
            <label
              htmlFor="principal-input"
              className="block text-xs font-medium mb-1.5"
              style={{ color: "#94a3b8" }}
            >
              Target User's Principal ID
            </label>
            <input
              id="principal-input"
              type="text"
              value={principalInput}
              onChange={(e) => {
                setPrincipalInput(e.target.value);
                if (principalError) setPrincipalError("");
              }}
              onBlur={() => {
                if (principalInput) validatePrincipal(principalInput);
              }}
              placeholder="e.g. 2vxsx-fae or xxxxx-xxxxx-xxxxx-xxxxx-cai"
              data-ocid="admin.settings.input"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg outline-none transition-all font-mono"
              style={{
                background: "#0d0d1a",
                border: `1px solid ${principalError ? "#ef4444" : "#2a2a4a"}`,
                color: "#e2e8f0",
              }}
              onFocus={(e) => {
                if (!principalError) e.target.style.borderColor = "#6366f1";
              }}
              onMouseLeave={(e) => {
                if (!principalError)
                  (e.target as HTMLInputElement).style.borderColor = "#2a2a4a";
              }}
            />
            {principalError && (
              <p
                className="text-xs mt-1.5"
                style={{ color: "#ef4444" }}
                data-ocid="admin.settings.error_state"
              >
                {principalError}
              </p>
            )}
          </div>

          <button
            type="button"
            data-ocid="admin.settings.submit_button"
            onClick={handleAssignAdmin}
            disabled={isAssigning || !principalInput.trim()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "#6366f1",
              color: "#fff",
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                (e.currentTarget as HTMLElement).style.background = "#4f46e5";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#6366f1";
            }}
          >
            {isAssigning ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Assigning…
              </>
            ) : (
              <>
                <Shield size={14} />
                Assign Admin Role
              </>
            )}
          </button>
        </div>
      </div>

      {/* Danger zone: Revoke admin */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "#1a1a35",
          border: "1px solid #ef444430",
        }}
        data-ocid="admin.settings.card"
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "#ef444415" }}
          >
            <Shield size={16} style={{ color: "#ef4444" }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
            Revoke Admin Role
          </h3>
        </div>

        <p className="text-xs mb-4" style={{ color: "#64748b" }}>
          To downgrade a user from admin to regular user, enter their Principal
          ID below.
        </p>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Principal ID to revoke"
            id="revoke-principal"
            data-ocid="admin.settings.input"
            className="w-full px-3.5 py-2.5 text-sm rounded-lg outline-none transition-all font-mono"
            style={{
              background: "#0d0d1a",
              border: "1px solid #ef444430",
              color: "#e2e8f0",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#ef4444";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#ef444430";
            }}
            onChange={(e) => {
              // Track in separate state if needed
              (
                document.getElementById("revoke-btn") as HTMLButtonElement
              ).disabled = !e.target.value.trim();
            }}
          />
          <button
            id="revoke-btn"
            type="button"
            disabled
            data-ocid="admin.settings.delete_button"
            onClick={async () => {
              const input = document.getElementById(
                "revoke-principal",
              ) as HTMLInputElement;
              if (!actor || !input.value.trim()) return;
              try {
                const principal = Principal.fromText(input.value.trim());
                await actor.assignCallerUserRole(principal, UserRole.user);
                toast.success("Admin role revoked successfully.");
                input.value = "";
                (
                  document.getElementById("revoke-btn") as HTMLButtonElement
                ).disabled = true;
              } catch (err: unknown) {
                const error = err as Error;
                toast.error("Failed to revoke role", {
                  description: error?.message,
                });
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#ef4444", color: "#fff" }}
          >
            <Shield size={14} />
            Revoke Admin
          </button>
        </div>
      </div>
    </div>
  );
}
