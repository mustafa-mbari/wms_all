import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Warehouse, Loader2, LogIn, UserPlus, Package } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      firstName: "",
      lastName: "",
      isActive: true,
    },
  });

  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: RegisterFormValues) => {
    // Remove confirmPassword as it's not part of the API schema
    const { confirmPassword, ...registrationData } = values;
    registerMutation.mutate(registrationData);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white dark:bg-gray-900">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo and Title */}
          <div className="text-center mb-10">
            <div className="flex justify-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                <Warehouse size={32} className="text-white" />
              </div>
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
              WMS System
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Professional Warehouse Management
            </p>
          </div>

          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <TabsTrigger 
                value="login" 
                className="rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-0">
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Please sign in to your account
                  </p>
                </div>

                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Username
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your username" 
                              className="h-12 px-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                              {...field} 
                            />
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
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password"
                              className="h-12 px-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <LogIn className="mr-2 h-5 w-5" />
                      )}
                      Sign In
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto font-medium text-blue-600 hover:text-blue-500"
                      onClick={() => setActiveTab("register")}
                    >
                      Create one here
                    </Button>
                  </p>
                </div>

                {/* Demo Credentials */}
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Demo Credentials:</h4>
                  <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                    <div className="flex justify-between">
                      <span>Admin:</span>
                      <span className="font-mono">admin / admin123</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Demo:</span>
                      <span className="font-mono">demo / demo123</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Manager:</span>
                      <span className="font-mono">manager / manager123</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-0">
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Create account</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Get started with your WMS account
                  </p>
                </div>

                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              First Name
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="John" 
                                className="h-12 px-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Last Name
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Doe" 
                                className="h-12 px-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Username
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter username" 
                              className="h-12 px-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                              {...field} 
                            />
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
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Enter email" 
                              className="h-12 px-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                              {...field} 
                            />
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
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter password"
                              className="h-12 px-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Confirm Password
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm password"
                              className="h-12 px-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <UserPlus className="mr-2 h-5 w-5" />
                      )}
                      Create Account
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto font-medium text-blue-600 hover:text-blue-500"
                      onClick={() => setActiveTab("login")}
                    >
                      Sign in here
                    </Button>
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Column - Hero */}
      <div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative flex flex-col justify-center px-12 lg:px-16 xl:px-24 text-white">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Warehouse Management System
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Streamline your warehouse operations with our comprehensive WMS solution.
              Manage inventory, track orders, and optimize your supply chain with ease.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold">Inventory Management</h3>
                  <p className="text-sm text-white/80">Real-time stock tracking and automated alerts</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Warehouse className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold">Multi-Warehouse Support</h3>
                  <p className="text-sm text-white/80">Manage multiple locations from one platform</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <LogIn className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold">Advanced Analytics</h3>
                  <p className="text-sm text-white/80">Comprehensive reporting and insights</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
