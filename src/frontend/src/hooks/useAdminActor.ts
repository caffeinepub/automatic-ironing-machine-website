/**
 * useAdminActor — creates a backend actor using the current Internet Identity
 * session so that admin-only backend calls work.
 *
 * The admin must have previously logged in via AdminLoginPage which calls
 * _initializeAccessControlWithSecret to register them as admin in the canister.
 * Once registered, the same II principal always has admin access.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { getSecretParameter } from "../utils/urlParams";
import { useInternetIdentity } from "./useInternetIdentity";

const ADMIN_ACTOR_KEY = "adminActor";

function getAdminToken(): string {
  return (
    getSecretParameter("caffeineAdminToken") ||
    sessionStorage.getItem("caffeineAdminToken") ||
    localStorage.getItem("caffeineAdminToken") ||
    ""
  );
}

export function useAdminActor() {
  const queryClient = useQueryClient();
  const { identity, isInitializing } = useInternetIdentity();

  const principalKey = identity?.getPrincipal().toString() ?? "anon";

  const actorQuery = useQuery<backendInterface>({
    queryKey: [ADMIN_ACTOR_KEY, principalKey],
    queryFn: async () => {
      if (identity) {
        // Create an authenticated actor so the canister recognises the principal
        const actor = await createActorWithConfig({
          agentOptions: { identity },
        });

        // Re-initialize access control (idempotent — safe to call on every session start)
        const adminToken = getAdminToken();
        if (adminToken) {
          try {
            await actor._initializeAccessControlWithSecret(adminToken);
          } catch {
            // Already registered or token mismatch — ignore, the principal
            // may still have admin access from a previous registration
          }
        }
        return actor;
      }

      // Fallback: anonymous actor. Admin-only calls will fail, but this
      // prevents crashes while II is still loading.
      return await createActorWithConfig();
    },
    // Don't run until II has finished initializing (to avoid anonymous actor being cached)
    enabled: !isInitializing,
    staleTime: Number.POSITIVE_INFINITY,
    retry: 2,
    retryDelay: 1000,
  });

  // When the actor becomes available (or changes), invalidate all admin data queries
  // so they re-fetch with the newly authenticated actor
  useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) =>
          !query.queryKey.includes(ADMIN_ACTOR_KEY) &&
          (query.queryKey.includes("adminOrders") ||
            query.queryKey.includes("adminRegisteredUsers")),
      });
    }
  }, [actorQuery.data, queryClient]);

  return {
    actor: actorQuery.data ?? null,
    isFetching: actorQuery.isFetching || isInitializing,
  };
}
