import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Bell, Shield, Database, Globe } from "lucide-react";

// Form schemas
const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  department: z.string().optional(),
});

const systemFormSchema = z.object({
  darkMode: z.boolean(),
  notifications: z.boolean(),
  defaultWarehouseId: z.string().optional(),
  languagePreference: z.string(),
  timezone: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type SystemFormValues = z.infer<typeof systemFormSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  // Dummy data for warehouses, languages, etc. - replace with actual data fetching
  const warehouses = [
    { id: "warehouse1", name: "Main Warehouse" },
    { id: "warehouse2", name: "Secondary Warehouse" },
    { id: "warehouse3", name: "Distribution Center" },
  ];

  const languages = [
    { value: "en", label: "English" },
    { value: "ar", label: "Arabic" },
    { value: "fr", label: "French" },
    { value: "es", label: "Spanish" },
  ];

  // Initialize forms with default values
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@company.com",
      phone: "+1234567890",
      department: "operations",
    },
  });

  const systemForm = useForm<SystemFormValues>({
    resolver: zodResolver(systemFormSchema),
    defaultValues: {
      darkMode: false,
      notifications: true,
      defaultWarehouseId: "warehouse1",
      languagePreference: "english",
      timezone: "UTC",
    },
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsUpdating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const onSystemSubmit = async (data: SystemFormValues) => {
    setIsUpdating(true);
    try {
      // Handle dark mode
      localStorage.setItem("darkMode", data.darkMode.toString());

      // Save preferences
      localStorage.setItem("userPreferences", JSON.stringify({
        defaultWarehouseId: data.defaultWarehouseId,
        languagePreference: data.languagePreference,
        timezone: data.timezone,
      }));

      // Apply dark mode changes
      const html = document.documentElement;
      if (data.darkMode) {
        html.classList.add("dark");
      } else {
        html.classList.remove("dark");
      }

      toast({
        title: "Settings Updated",
        description: "Your system settings have been updated successfully",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="system">
              <Globe className="w-4 h-4 mr-2" />
              System
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and contact details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="operations">Operations</SelectItem>
                              <SelectItem value="logistics">Logistics</SelectItem>
                              <SelectItem value="management">Management</SelectItem>
                              <SelectItem value="it">IT</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Profile
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>
                  Configure your system-wide preferences and defaults.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...systemForm}>
                  <form onSubmit={systemForm.handleSubmit(onSystemSubmit)} className="space-y-6">
                    <FormField
                      control={systemForm.control}
                      name="darkMode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Dark Mode</FormLabel>
                            <FormDescription>
                              Switch between light and dark themes.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={systemForm.control}
                      name="notifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Notifications</FormLabel>
                            <FormDescription>
                              Receive notifications about system events.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={systemForm.control}
                      name="defaultWarehouseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Warehouse</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a warehouse" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="none">Select a warehouse</SelectItem>
                                {warehouses?.map((warehouse) => (
                                  <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                    {warehouse.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                          </Select>
                          <FormDescription>
                            Default warehouse for new operations.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={systemForm.control}
                      name="languagePreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="ar">Arabic</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={systemForm.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timezone</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a timezone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="UTC">UTC</SelectItem>
                              <SelectItem value="America/New_York">Eastern Time</SelectItem>
                              <SelectItem value="America/Chicago">Central Time</SelectItem>
                              <SelectItem value="America/Denver">Mountain Time</SelectItem>
                              <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                              <SelectItem value="Europe/London">GMT</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Your preferred timezone for dates and times.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Preferences
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="text-base font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="text-base font-medium">Low Stock Alerts</div>
                    <div className="text-sm text-muted-foreground">
                      Get notified when inventory is running low
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="text-base font-medium">Order Updates</div>
                    <div className="text-sm text-muted-foreground">
                      Notifications for order status changes
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Change Password</h3>
                  <p className="text-sm text-muted-foreground">
                    Update your password to keep your account secure.
                  </p>
                  <Button variant="outline">Change Password</Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account.
                  </p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Active Sessions</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your active login sessions.
                  </p>
                  <Button variant="outline">View Sessions</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}