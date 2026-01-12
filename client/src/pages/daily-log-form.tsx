import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { z } from "zod";
import { format } from "date-fns";
import { useCreateDailyLog, useUpdateDailyLog, useDailyLogs } from "@/hooks/use-daily-logs";
import { insertDailyLogSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";

// Symptoms list
const SYMPTOMS = [
  "Cramps", "Headache", "Bloating", "Fatigue", "Acne", "Backache", 
  "Breast Tenderness", "Nausea", "Insomnia", "Cravings"
];

// Moods list
const MOODS = [
  "Happy", "Sad", "Anxious", "Irritable", "Energetic", "Calm", "Mood Swings"
];

export default function DailyLogForm() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const dateParam = searchParams.get("date") || format(new Date(), "yyyy-MM-dd");

  const { data: logs } = useDailyLogs();
  const createLog = useCreateDailyLog();
  const updateLog = useUpdateDailyLog();

  const existingLog = logs?.find(l => format(new Date(l.date), "yyyy-MM-dd") === dateParam);

  const form = useForm<z.infer<typeof insertDailyLogSchema>>({
    resolver: zodResolver(insertDailyLogSchema.omit({ userId: true })),
    defaultValues: {
      date: dateParam,
      flowIntensity: undefined,
      symptoms: [],
      mood: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (existingLog) {
      form.reset({
        date: existingLog.date.toString(), // Ensure string format
        flowIntensity: existingLog.flowIntensity,
        symptoms: existingLog.symptoms || [],
        mood: existingLog.mood,
        notes: existingLog.notes,
      });
    }
  }, [existingLog, form]);

  const onSubmit = (data: z.infer<typeof insertDailyLogSchema>) => {
    // Only omit userId, schema handles types
    const submissionData = {
       ...data,
       // ensure empty string is treated as null/undefined for optional text fields if needed, 
       // but our schema allows text.
    };

    if (existingLog) {
      updateLog.mutate({ id: existingLog.id, ...submissionData }, {
        onSuccess: () => setLocation("/dashboard")
      });
    } else {
      createLog.mutate(submissionData, {
        onSuccess: () => setLocation("/dashboard")
      });
    }
  };

  const isPending = createLog.isPending || updateLog.isPending;

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Daily Check-in</h1>
        <p className="text-muted-foreground">Log your symptoms for {format(new Date(dateParam), "MMMM d, yyyy")}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Flow Intensity Section */}
          <Card className="shadow-md border-none ring-1 ring-border/50">
            <CardHeader>
               <CardTitle>Menstruation</CardTitle>
               <CardDescription>How is your flow today?</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="flowIntensity"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                      >
                        {['spotting', 'light', 'medium', 'heavy'].map((intensity) => (
                           <FormItem key={intensity}>
                              <FormControl>
                                 <RadioGroupItem value={intensity} className="peer sr-only" />
                              </FormControl>
                              <FormLabel className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                                 <div className={`w-4 h-4 rounded-full mb-2 ${
                                    intensity === 'spotting' ? 'bg-orange-200' :
                                    intensity === 'light' ? 'bg-pink-300' :
                                    intensity === 'medium' ? 'bg-red-400' : 'bg-red-600'
                                 }`} />
                                 <span className="capitalize font-medium">{intensity}</span>
                              </FormLabel>
                           </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Symptoms Section */}
          <Card className="shadow-md border-none ring-1 ring-border/50">
            <CardHeader>
               <CardTitle>Symptoms</CardTitle>
               <CardDescription>What are you experiencing?</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="symptoms"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {SYMPTOMS.map((symptom) => (
                        <FormField
                          key={symptom}
                          control={form.control}
                          name="symptoms"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={symptom}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(symptom)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), symptom])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== symptom
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {symptom}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Mood Section */}
          <Card className="shadow-md border-none ring-1 ring-border/50">
            <CardHeader>
               <CardTitle>Mood</CardTitle>
               <CardDescription>How are you feeling emotionally?</CardDescription>
            </CardHeader>
            <CardContent>
               <FormField
                  control={form.control}
                  name="mood"
                  render={({ field }) => (
                     <FormItem>
                        <FormControl>
                           <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value || undefined}
                              className="flex flex-wrap gap-2"
                           >
                              {MOODS.map(mood => (
                                 <FormItem key={mood}>
                                    <FormControl>
                                       <RadioGroupItem value={mood} className="peer sr-only" />
                                    </FormControl>
                                    <FormLabel className="px-4 py-2 rounded-full border border-border bg-white hover:bg-muted peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white cursor-pointer transition-colors block">
                                       {mood}
                                    </FormLabel>
                                 </FormItem>
                              ))}
                           </RadioGroup>
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card className="shadow-md border-none ring-1 ring-border/50">
             <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>Anything else you want to remember?</CardDescription>
             </CardHeader>
             <CardContent>
                <FormField
                   control={form.control}
                   name="notes"
                   render={({ field }) => (
                      <FormItem>
                         <FormControl>
                            <Textarea 
                               placeholder="Had a great workout today..." 
                               className="resize-none min-h-[100px] rounded-xl"
                               {...field} 
                               value={field.value || ""}
                            />
                         </FormControl>
                         <FormMessage />
                      </FormItem>
                   )}
                />
             </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
             <Button type="button" variant="ghost" onClick={() => setLocation("/dashboard")}>Cancel</Button>
             <Button 
               type="submit" 
               disabled={isPending}
               className="min-w-[150px] rounded-xl shadow-lg shadow-primary/20"
             >
               {isPending ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
               Save Entry
             </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
