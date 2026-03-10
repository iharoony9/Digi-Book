import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useAccountBalance() {
  const url = buildUrl(api.settings.get.path, { key: "account_balance" });
  
  return useQuery({
    queryKey: [url],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null; // Balance not set yet
      if (!res.ok) throw new Error("Failed to fetch balance");
      return api.settings.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateAccountBalance() {
  const queryClient = useQueryClient();
  const url = buildUrl(api.settings.update.path, { key: "account_balance" });

  return useMutation({
    mutationFn: async (value: string) => {
      const res = await fetch(url, {
        method: api.settings.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update balance");
      return api.settings.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [url] });
    },
  });
}
