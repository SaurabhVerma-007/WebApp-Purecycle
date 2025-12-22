import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertDailyLog } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useDailyLogs() {
  return useQuery({
    queryKey: [api.dailyLogs.list.path],
    queryFn: async () => {
      const res = await fetch(api.dailyLogs.list.path);
      if (!res.ok) throw new Error("Failed to fetch daily logs");
      return api.dailyLogs.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateDailyLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertDailyLog, "userId">) => {
      const res = await fetch(api.dailyLogs.create.path, {
        method: api.dailyLogs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save log");
      return api.dailyLogs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.dailyLogs.list.path] });
      toast({
        title: "Log saved",
        description: "Your daily symptoms have been recorded.",
      });
    },
  });
}

export function useUpdateDailyLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<Omit<InsertDailyLog, "userId">>) => {
      const url = buildUrl(api.dailyLogs.update.path, { id });
      const res = await fetch(url, {
        method: api.dailyLogs.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update log");
      return api.dailyLogs.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.dailyLogs.list.path] });
      toast({
        title: "Log updated",
        description: "Your daily log has been updated.",
      });
    },
  });
}
