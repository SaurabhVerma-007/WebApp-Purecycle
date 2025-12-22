import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertCycle } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCycles() {
  return useQuery({
    queryKey: [api.cycles.list.path],
    queryFn: async () => {
      const res = await fetch(api.cycles.list.path);
      if (!res.ok) throw new Error("Failed to fetch cycles");
      return api.cycles.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateCycle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertCycle, "userId">) => {
      const res = await fetch(api.cycles.create.path, {
        method: api.cycles.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create cycle");
      return api.cycles.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cycles.list.path] });
      toast({
        title: "Cycle logged",
        description: "Your new cycle has been started.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  });
}

export function useUpdateCycle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<Omit<InsertCycle, "userId">>) => {
      const url = buildUrl(api.cycles.update.path, { id });
      const res = await fetch(url, {
        method: api.cycles.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update cycle");
      return api.cycles.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cycles.list.path] });
      toast({
        title: "Cycle updated",
        description: "Your cycle details have been updated.",
      });
    },
  });
}
