import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useAiChat() {
  return useMutation({
    mutationFn: async ({ message, context }: { message: string; context?: string }) => {
      const res = await fetch(api.ai.chat.path, {
        method: api.ai.chat.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context }),
      });

      if (!res.ok) throw new Error("Failed to get AI response");

      // Handle SSE streaming — read the full stream and return final response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      if (!reader) throw new Error("No response body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullResponse += data.content;
              }
              if (data.done && data.response) {
                fullResponse = data.response;
              }
            } catch {
              // skip malformed lines
            }
          }
        }
      }

      return { response: fullResponse };
    },
  });
}