import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, createBillRequestSchema } from "@shared/routes";
import { z } from "zod";

type CreateBillInput = z.infer<typeof createBillRequestSchema>;

export function useBills() {
  return useQuery({
    queryKey: [api.bills.list.path],
    queryFn: async () => {
      const res = await fetch(api.bills.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch bills");
      return api.bills.list.responses[200].parse(await res.json());
    },
  });
}

export function useBill(id: number) {
  const url = buildUrl(api.bills.get.path, { id });
  return useQuery({
    queryKey: [url],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch bill");
      return api.bills.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBillInput) => {
      const res = await fetch(api.bills.create.path, {
        method: api.bills.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create bill");
      return api.bills.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bills.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stocks.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.contacts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
    },
  });
}

export function useDeleteBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/bills/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete bill");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bills.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stocks.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.contacts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
    },
  });
}
