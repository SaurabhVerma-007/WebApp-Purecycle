import { useState } from "react";
import { useDailyLogs } from "@/hooks/use-daily-logs";
import { useCycles } from "@/hooks/use-cycles";
import { DayPicker } from "react-day-picker";
import { format, isSameDay, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Loader2, Plus } from "lucide-react";
import { Link } from "wouter";
import "react-day-picker/dist/style.css";

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { data: logs, isLoading: logsLoading } = useDailyLogs();
  const { data: cycles, isLoading: cyclesLoading } = useCycles();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  if (logsLoading || cyclesLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Helper to check days
  const getDayStatus = (day: Date) => {
    // Check if it's a logged period day
    const log = logs?.find(l => isSameDay(new Date(l.date), day));
    if (log?.flowIntensity) return 'period-log';
    
    // Check if within a cycle start (simple visualization)
    const cycleStart = cycles?.find(c => isSameDay(new Date(c.startDate), day));
    if (cycleStart) return 'cycle-start';
    
    return null;
  };
  
  // Custom modifiers for calendar
  const modifiers = {
    period: (date: Date) => getDayStatus(date) === 'period-log' || getDayStatus(date) === 'cycle-start',
  };
  
  const modifiersStyles = {
    period: {
      color: 'white',
      backgroundColor: 'var(--period)',
      borderRadius: '50%'
    }
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsSheetOpen(true);
  };

  const selectedLog = logs?.find(l => selectedDate && isSameDay(new Date(l.date), selectedDate));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display font-bold">Calendar</h1>
        <Link href="/log">
           <Button className="rounded-xl shadow-lg shadow-primary/20">
             <Plus className="w-4 h-4 mr-2" /> Add Entry
           </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-2 border-none shadow-lg shadow-black/5">
          <CardContent className="p-6 flex justify-center">
             <style>{`
               .rdp { --rdp-cell-size: 50px; --rdp-accent-color: hsl(var(--primary)); }
               .rdp-day_selected:not([disabled]) { font-weight: bold; background-color: transparent; border: 2px solid hsl(var(--primary)); color: inherit; }
             `}</style>
             <DayPicker
               mode="single"
               selected={selectedDate}
               onSelect={setSelectedDate}
               onDayClick={handleDayClick}
               modifiers={modifiers}
               modifiersStyles={modifiersStyles}
               showOutsideDays
               className="font-sans"
             />
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="bg-primary/5 border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg">Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                 <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-[hsl(var(--period))]"></div>
                    <span className="text-sm">Period</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-[hsl(var(--fertile))]"></div>
                    <span className="text-sm">Fertile Window (Est.)</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-[hsl(var(--ovulation))]"></div>
                    <span className="text-sm">Ovulation (Est.)</span>
                 </div>
              </CardContent>
           </Card>
           
           <Card>
             <CardHeader>
               <CardTitle className="text-lg">
                 {selectedDate ? format(selectedDate, "MMMM d") : "Select a date"}
               </CardTitle>
             </CardHeader>
             <CardContent>
                {selectedLog ? (
                  <div className="space-y-4">
                    {selectedLog.flowIntensity && (
                       <div>
                         <span className="text-xs text-muted-foreground uppercase font-bold">Flow</span>
                         <p className="capitalize font-medium">{selectedLog.flowIntensity}</p>
                       </div>
                    )}
                    {selectedLog.mood && (
                       <div>
                         <span className="text-xs text-muted-foreground uppercase font-bold">Mood</span>
                         <p className="capitalize font-medium">{selectedLog.mood}</p>
                       </div>
                    )}
                    {selectedLog.symptoms && selectedLog.symptoms.length > 0 && (
                       <div>
                         <span className="text-xs text-muted-foreground uppercase font-bold mb-1 block">Symptoms</span>
                         <div className="flex flex-wrap gap-1">
                           {selectedLog.symptoms.map(s => (
                             <Badge key={s} variant="secondary">{s}</Badge>
                           ))}
                         </div>
                       </div>
                    )}
                    <Button 
                       variant="outline" 
                       className="w-full mt-4" 
                       onClick={() => setIsSheetOpen(true)}
                    >
                      View Details
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="mb-4">No entry for this day.</p>
                    <Link href={`/log?date=${selectedDate ? format(selectedDate, "yyyy-MM-dd") : ''}`}>
                      <Button variant="outline">Log Symptoms</Button>
                    </Link>
                  </div>
                )}
             </CardContent>
           </Card>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {selectedDate ? format(selectedDate, "EEEE, MMMM d") : "Daily Log"}
            </SheetTitle>
            <SheetDescription>
              {selectedLog ? "Details for this day" : "No logs recorded for this day."}
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-8 space-y-6">
            {selectedLog ? (
              <>
                 <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase">Flow Intensity</h3>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                         selectedLog.flowIntensity === 'heavy' ? 'bg-red-100 text-red-700' : 
                         selectedLog.flowIntensity === 'medium' ? 'bg-pink-100 text-pink-700' : 
                         selectedLog.flowIntensity === 'light' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100'
                    }`}>
                      {selectedLog.flowIntensity || "None"}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase">Symptoms</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedLog.symptoms?.map(s => (
                        <Badge key={s} variant="outline" className="px-3 py-1">{s}</Badge>
                      )) || "None"}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase">Mood</h3>
                    <p className="text-lg">{selectedLog.mood || "Not recorded"}</p>
                 </div>

                 <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase">Notes</h3>
                    <p className="text-gray-700 bg-muted/30 p-4 rounded-lg italic">
                      {selectedLog.notes || "No notes."}
                    </p>
                 </div>
                 
                 <div className="pt-8">
                   <Link href={`/log?date=${format(new Date(selectedLog.date), "yyyy-MM-dd")}`}>
                     <Button className="w-full">Edit Log</Button>
                   </Link>
                 </div>
              </>
            ) : (
               <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                 <p className="text-muted-foreground">Nothing logged for this specific day.</p>
                 <Link href={`/log?date=${selectedDate ? format(selectedDate, "yyyy-MM-dd") : ''}`}>
                    <Button onClick={() => setIsSheetOpen(false)}>Create Entry</Button>
                 </Link>
               </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
