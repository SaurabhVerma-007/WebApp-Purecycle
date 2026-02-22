import { useState } from "react";
import { useLogin, useRegister, useUser } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { insertUserSchema } from "@shared/schema";
import { Loader2, Sparkles } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { data: user } = useUser();
  const [, setLocation] = useLocation();

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof insertUserSchema>>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: { username: "", password: "", displayName: "", email: "" },
  });

  if (user) {
    setLocation("/");
    return null;
  }

  const onLogin = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: z.infer<typeof insertUserSchema>) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex flex-col justify-center p-12 bg-primary/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
        
        <div className="relative z-10 max-w-md mx-auto">
           {/* Unsplash image: Woman relaxing with tea and book */}
           {/* <img 
             src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80" 
             alt="Relaxing woman" 
             className="rounded-2xl shadow-2xl mb-8 object-cover w-full h-64"
           /> */}
          <div className="mb-8 flex items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold font-display text-2xl shadow-lg">
                L
             </div>
             <h1 className="font-display text-4xl font-bold text-gray-900">PureCycle</h1>
          </div>
          
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Understand your body, <br/> embrace your rhythm.
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Track your cycle, symptoms, and mood with PureCycle's privacy-first AI insights tailored just for you.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
              <Sparkles className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-semibold mb-1">AI Insights</h3>
              <p className="text-sm text-muted-foreground">Personalized daily wellness tips</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
              <Sparkles className="w-6 h-6 text-purple-500 mb-2" />
              <h3 className="font-semibold mb-1">Private</h3>
              <p className="text-sm text-muted-foreground">Your data stays yours, always secure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Forms */}
      <div className="flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-primary mb-2">PureCycle</h1>
            <p className="text-muted-foreground">Your cycle, simplified.</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
              <TabsTrigger value="login" className="text-base">Login</TabsTrigger>
              <TabsTrigger value="register" className="text-base">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl">Welcome back</CardTitle>
                  <CardDescription>Enter your credentials to access your dashboard</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} className="h-12 rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} className="h-12 rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full h-12 rounded-xl text-lg font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : "Sign In"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl">Create an account</CardTitle>
                  <CardDescription>Start your wellness journey today</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} className="h-12 rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="What should we call you?" {...field} value={field.value ?? ""} className="h-12 rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Optional)</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} value={field.value ?? ""} className="h-12 rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a password" {...field} className="h-12 rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full h-12 rounded-xl text-lg font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
