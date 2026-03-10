import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { insertStockSchema } from "@shared/schema";
import { z } from "zod";

type StockInput = z.infer<typeof insertStockSchema>;

export function useStocks() {
  return useQuery({
    queryKey: [api.stocks.list.path],
    queryFn: async () => {
      const res = await fetch(api.stocks.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stocks");
      return api.stocks.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: StockInput) => {
      const res = await fetch(api.stocks.create.path, {
        method: api.stocks.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create stock");
      return api.stocks.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.stocks.list.path] }),
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<StockInput> & { id: number }) => {
      const url = buildUrl(api.stocks.update.path, { id });
      const res = await fetch(url, {
        method: api.stocks.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update stock");
      return api.stocks.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.stocks.list.path] }),
  });
}

export function useDeleteStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/stocks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete stock");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.stocks.list.path] }),
  });
}
