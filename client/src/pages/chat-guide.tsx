import { useState, useRef, useEffect } from "react";
import { useAiChat } from "@/hooks/use-ai-chat";
import { useUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: "Hello! I'm your PureCycle assistant. Ask me anything about your cycle, symptoms, or general wellness. Note that I don't provide medical diagnoses."
};

const STORAGE_KEY = "purecycle_chat_history";

export default function ChatGuide() {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load messages from sessionStorage on first render
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [INITIAL_MESSAGE];
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMutation = useAiChat();
  const { data: user } = useUser();

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Auto scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    chatMutation.mutate(
      { message: userMessage.content, context: `User: ${user?.displayName || user?.username}` },
      {
        onSuccess: (data) => {
          setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        },
        onError: () => {
          setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again later." }]);
        }
      }
    );
  };

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] flex flex-col max-w-4xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <Sparkles className="text-primary w-6 h-6" />
            AI Health Guide
          </h1>
          <p className="text-muted-foreground">Ask questions, get wellness tips, and understand your body better.</p>
        </div>
        {/* Clear chat button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive text-xs mt-1"
          onClick={() => {
            sessionStorage.removeItem(STORAGE_KEY);
            setMessages([INITIAL_MESSAGE]);
          }}
        >
          Clear Chat
        </Button>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-xl shadow-primary/5 bg-white/80 backdrop-blur-md">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6 pb-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-secondary/40 text-foreground rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                )}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="bg-secondary/40 p-4 rounded-2xl rounded-tl-none flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-border bg-white/50 backdrop-blur-sm">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about cramps, diet, or sleep..."
              className="rounded-xl h-12 bg-white"
              disabled={chatMutation.isPending}
            />
            <Button
              type="submit"
              size="icon"
              className="h-12 w-12 rounded-xl shrink-0 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              disabled={chatMutation.isPending || !input.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-3">
            PureCycle is an AI assistant and not a substitute for professional medical advice.
          </p>
        </div>
      </Card>
    </div>
  );
}