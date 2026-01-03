import { useUser } from "@/hooks/use-auth";
import { useCycles, useCreateCycle } from "@/hooks/use-cycles";
import { useDailyLogs } from "@/hooks/use-daily-logs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";
import { Droplets, Calendar as CalendarIcon, ArrowRight, Activity, Plus } from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";

export default function Dashboard() {
  const { data: user } = useUser();
  const { data: cycles } = useCycles();
  const { data: logs } = useDailyLogs();
  const createCycle = useCreateCycle();

  // Basic Cycle Logic (MVP)
  // Find latest cycle
  const currentCycle = cycles?.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];
  
  let cycleStatus = "No cycle data yet";
  let cycleDay = 0;
  let nextPeriodDate: Date | null = null;
  let fertileWindowStart: Date | null = null;
  
  if (currentCycle) {
    const start = new Date(currentCycle.startDate);
    const today = new Date();
    cycleDay = differenceInDays(today, start) + 1;
    
    // Assume 28 day cycle for MVP estimation
    nextPeriodDate = addDays(start, 28);
    fertileWindowStart = addDays(start, 11); // Rough estimate: days 12-16
    
    cycleStatus = `Day ${cycleDay} of Cycle`;
  }

  const handleStartPeriod = () => {
    // Start a new cycle today
    const today = format(new Date(), "yyyy-MM-dd");
    createCycle.mutate({ startDate: today, notes: "Started via dashboard" });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Hello, {user?.displayName || user?.username}
          </h1>
          <p className="text-muted-foreground mt-1">Here's your wellness summary for today.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/log">
            <Button variant="outline" className="rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary">
              <Activity className="mr-2 w-4 h-4" /> Log Symptoms
            </Button>
          </Link>
          <Button 
            onClick={handleStartPeriod} 
            disabled={createCycle.isPending}
            className="rounded-xl shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            <Droplets className="mr-2 w-4 h-4" /> 
            {createCycle.isPending ? "Starting..." : "Period Started Today"}
          </Button>
        </div>
      </div>

      {/* Main Status Card */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 to-transparent border-none shadow-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-8 relative z-10 flex flex-col justify-between h-full min-h-[240px]">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Current Status</div>
              <div className="text-5xl font-display font-bold text-gray-900 mb-2">{cycleStatus}</div>
              {nextPeriodDate && (
                <p className="text-lg text-muted-foreground">
                  Period expected around <span className="font-semibold text-gray-800">{format(nextPeriodDate, "MMM d")}</span>
                </p>
              )}
            </div>

            {currentCycle && (
               <div className="mt-8 flex gap-4">
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50 flex-1">
                     <span className="block text-xs text-muted-foreground uppercase font-bold">Fertile Window</span>
                     <span className="text-lg font-semibold text-green-700">
                       {fertileWindowStart ? `Approx. ${format(fertileWindowStart, "MMM d")}` : "Calculating..."}
                     </span>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50 flex-1">
                     <span className="block text-xs text-muted-foreground uppercase font-bold">Cycle Length</span>
                     <span className="text-lg font-semibold text-purple-700">28 Days (Est.)</span>
                  </div>
               </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Insights / Chat Promo */}
        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle>Daily Insight</CardTitle>
            <CardDescription>AI-powered wellness tips</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="bg-secondary/30 p-4 rounded-lg text-sm text-gray-700 leading-relaxed">
               {cycleDay > 0 && cycleDay <= 5 
                 ? "During menstruation, focus on iron-rich foods and gentle movement like walking or yoga."
                 : cycleDay > 10 && cycleDay < 16 
                 ? "Energy levels are typically peaking. Great time for high-intensity workouts or tackling big projects!"
                 : "Listen to your body. Rest is productive too."}
             </div>
             <Link href="/chat">
                <Button variant="ghost" className="w-full justify-between group">
                   Chat with Assistant <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
             </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Logs */}
      <h2 className="text-2xl font-display font-bold mt-8 mb-4">Recent Logs</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {logs?.slice(0, 4).map((log) => (
          <Card key={log.id} className="hover:border-primary/50 transition-colors cursor-pointer group">
            <CardContent className="p-5">
               <div className="flex justify-between items-start mb-2">
                 <span className="font-semibold text-gray-900">{format(new Date(log.date), "MMM d, yyyy")}</span>
                 {log.flowIntensity && (
                   <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                     log.flowIntensity === 'heavy' ? 'bg-red-100 text-red-700' : 
                     log.flowIntensity === 'medium' ? 'bg-pink-100 text-pink-700' : 'bg-orange-100 text-orange-700'
                   }`}>
                     {log.flowIntensity}
                   </span>
                 )}
               </div>
               <div className="space-y-1">
                  {log.mood && <p className="text-sm text-gray-600">Mood: {log.mood}</p>}
                  {log.symptoms && log.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {log.symptoms.slice(0, 3).map(s => (
                        <span key={s} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{s}</span>
                      ))}
                      {log.symptoms.length > 3 && <span className="text-[10px] text-gray-400">+{log.symptoms.length - 3}</span>}
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>
        ))}
        <Link href="/log">
          <Card className="border-dashed border-2 flex items-center justify-center hover:bg-muted/50 transition-colors cursor-pointer h-full min-h-[120px]">
             <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors">
                <Plus className="w-8 h-8 mb-2" />
                <span className="font-medium">Add New Log</span>
             </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
