import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertOrder, type InsertReservation } from "@shared/schema";

// Public Actions
export function useCreateOrder() {
  return useMutation({
    mutationFn: async (data: InsertOrder) => {
      const res = await fetch(api.orders.create.path, {
        method: api.orders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to place order");
      }
      return api.orders.create.responses[201].parse(await res.json());
    },
  });
}

export function useCreateReservation() {
  return useMutation({
    mutationFn: async (data: InsertReservation) => {
      const res = await fetch(api.reservations.create.path, {
        method: api.reservations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create reservation");
      }
      return api.reservations.create.responses[201].parse(await res.json());
    },
  });
}

// Admin Hooks
export function useAdminOrders(p0: { refetchInterval: number; }p0: { refetchInterval: number; }) {
  return useQuery({
    queryKey: [api.admin.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.admin.orders.list.path, {
        credentials: 'include',
      });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch orders");
      return api.admin.orders.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const url = buildUrl(api.admin.orders.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.admin.orders.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Failed to update status");
      return api.admin.orders.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.orders.list.path] });
    },
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const url = buildUrl(api.admin.reservations.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.admin.reservations.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Failed to update status");
      return api.admin.reservations.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.reservations.list.path] });
    },
  });
}

export function useAdminReservations() {
  return useQuery({
    queryKey: [api.admin.reservations.list.path],
    queryFn: async () => {
      const res = await fetch(api.admin.reservations.list.path, {
        credentials: 'include',
      });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch reservations");
      return api.admin.reservations.list.responses[200].parse(await res.json());
    },
  });
}
