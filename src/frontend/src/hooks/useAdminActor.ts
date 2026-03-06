/**
 * useAdminActor — creates a backend actor for admin operations.
 *
 * Strategy (v2 — password-only, no Internet Identity):
 * - Creates an anonymous actor (no identity needed)
 * - Admin API calls pass the admin secret directly as a parameter
 *   using the new getOrdersWithSecret / getRegisteredUsersWithSecret backend functions
 * - No Internet Identity required at all
 */
import { useQuery } from "@tanstack/react-query";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { ADMIN_SESSION_KEY } from "../pages/admin/AdminLoginPage";

export const ADMIN_SECRET = "airon2024";

export function getAdminSecret(): string {
  try {
    return (
      localStorage.getItem(ADMIN_SESSION_KEY) ||
      sessionStorage.getItem(ADMIN_SESSION_KEY) ||
      ADMIN_SECRET
    );
  } catch {
    return ADMIN_SECRET;
  }
}

export function useAdminActor() {
  const actorQuery = useQuery<backendInterface | null>({
    queryKey: ["adminActor_v2"],
    queryFn: async () => {
      // Create an anonymous actor — no identity needed for secret-based calls
      const actor = await createActorWithConfig();
      return actor;
    },
    staleTime: Number.POSITIVE_INFINITY,
    retry: 3,
    retryDelay: 1000,
  });

  return {
    actor: actorQuery.data ?? null,
    isFetching: actorQuery.isFetching,
    isError: actorQuery.isError,
  };
}
