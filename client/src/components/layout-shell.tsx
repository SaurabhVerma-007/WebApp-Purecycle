import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Calendar,
  PenTool,
  MessageCircleHeart,
  Settings,
  LogOut,
  Menu
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/log", label: "Daily Log", icon: PenTool },
    { href: "/chat", label: "AI Guide", icon: MessageCircleHeart },
  ];

  const handleLogout = () => {
    logout();
  };

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border min-h-screen p-6 shadow-sm z-10">
        <div className="mb-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold font-display text-xl">
            P
          </div>
          <h1 className="font-display text-2xl font-bold text-primary">PureCycle</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  location === item.href
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        <div className="pt-6 border-t border-border space-y-2">
          <Link href="/settings">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                location === "/settings"
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold font-display text-lg">
            P
          </div>
          <span className="font-display text-xl font-bold text-primary">PureCycle</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px]">
            <div className="flex flex-col h-full mt-8">
              <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                        location === item.href
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </div>
                  </Link>
                ))}
              </nav>
              <div className="pt-6 border-t border-border space-y-2 mb-8">
                 <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around p-2 pb-safe shadow-lg z-20">
        {navItems.slice(0, 4).map((item) => (
          <Link key={item.href} href={item.href}>
            <div className={`flex flex-col items-center p-2 rounded-lg cursor-pointer ${
               location === item.href ? "text-primary" : "text-muted-foreground"
            }`}>
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>
      {/* Spacer for bottom nav on mobile */}
      <div className="md:hidden h-16" />
    </div>
  );
}
