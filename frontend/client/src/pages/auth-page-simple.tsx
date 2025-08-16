import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Warehouse, Loader2, LogIn } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    
    if (username && password) {
      loginMutation.mutate({ username, password });
    }
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

          <div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Please sign in to your account
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <input 
                  name="username"
                  placeholder="Enter your username" 
                  className="mt-1 w-full h-12 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="mt-1 w-full h-12 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-5 w-5" />
                )}
                Sign In
              </button>
            </form>

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
          </div>
        </div>
      </div>
    </div>
  );
}
