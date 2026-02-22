import { useUser, useLogout } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LogOut, User, Bell, Shield, Moon } from "lucide-react";

export default function SettingsPage() {
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <Card>
        <CardHeader>
           <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Profile
           </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <Label className="text-muted-foreground">Username</Label>
                 <p className="font-medium text-lg">{user?.username}</p>
              </div>
              <div>
                 <Label className="text-muted-foreground">Display Name</Label>
                 <p className="font-medium text-lg">{user?.displayName || "Not set"}</p>
              </div>
              <div className="col-span-2">
                 <Label className="text-muted-foreground">Email</Label>
                 <p className="font-medium text-lg">{user?.email || "Not set"}</p>
              </div>
           </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
           <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Notifications (Coming Soon)
           </CardTitle>
           <CardDescription>Get alerts for your predicted cycle dates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                 <Label>Period Reminders</Label>
                 <p className="text-sm text-muted-foreground">Get notified 2 days before your period starts.</p>
              </div>
              <Switch disabled />
           </div>
           <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                 <Label>Log Reminders</Label>
                 <p className="text-sm text-muted-foreground">Daily reminder to log symptoms.</p>
              </div>
              <Switch disabled />
           </div>
        </CardContent>
      </Card>
      
      <Card>
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <Moon className="w-5 h-5 text-primary" /> Appearance
            </CardTitle>
         </CardHeader>
         <CardContent>
             <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                 <Label>Dark Mode</Label>
                 <p className="text-sm text-muted-foreground">Easier on the eyes at night.</p>
              </div>
              <Switch disabled checked={false} />
           </div>
         </CardContent>
      </Card>

      <Card>
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <Shield className="w-5 h-5 text-primary" /> Privacy & Data
            </CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
               Your health data is encrypted and stored securely. You can export or delete your data at any time.
            </p>
            <div className="flex gap-4">
               <Button variant="outline">Export Data</Button>
               <Button variant="destructive">Delete Account</Button>
            </div>
         </CardContent>
      </Card>

      <div className="flex justify-center pt-8">
         <Button variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => logout()}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
         </Button>
      </div>
    </div>
  );
}
