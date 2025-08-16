import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Eye, EyeOff, User, Mail, Lock, Warehouse, Shield, ArrowRight } from "lucide-react";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Add password toggle state
  const { loginMutation, registerMutation, user } = useAuth();

  // Redirect to dashboard when user becomes authenticated
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      if (activeTab === "login") {
        // Use the auth hook's login mutation
        await loginMutation.mutateAsync({ username, password });
        // Don't manually redirect - let the auth system handle it
      } else {
        // Register logic
        const email = formData.get("email") as string;
        await registerMutation.mutateAsync({ 
          username, 
          email, 
          password,
          firstName: username, // Use username as firstName for demo
          lastName: "User" // Default lastName
        });
        setActiveTab("login");
        setError("Registration successful! Please login.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-purple-100/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(147,197,253,0.1),transparent_50%)]"></div>
      </div>
      
      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in-50 duration-700">
        {/* Enhanced Header with improved logo design */}
        <div className="text-center mb-8 animate-in slide-in-from-top-4 duration-700 delay-100">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-2xl ring-4 ring-white/20 backdrop-blur-sm">
              <Warehouse className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">WarehousePro</h1>
          <p className="text-gray-600 text-lg font-medium">Manage your warehouse operations</p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-500">Secure & Trusted Platform</span>
          </div>
        </div>

        {/* Enhanced Auth Card with better shadows and backdrop */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden ring-1 ring-gray-900/5 animate-in slide-in-from-bottom-4 duration-700 delay-200">
          {/* Enhanced Tabs with better hover effects */}
          <div className="flex border-b border-gray-100/80 bg-gray-50/50">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-5 px-6 text-center font-semibold transition-all duration-300 relative group ${
                activeTab === "login"
                  ? "text-blue-600 bg-white shadow-sm border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              }`}
              aria-label="Switch to login form"
            >
              <span className="flex items-center justify-center space-x-2">
                <User className="w-4 h-4" />
                <span>Login</span>
              </span>
              {activeTab === "login" && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-5 px-6 text-center font-semibold transition-all duration-300 relative group ${
                activeTab === "register"
                  ? "text-blue-600 bg-white shadow-sm border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              }`}
              aria-label="Switch to register form"
            >
              <span className="flex items-center justify-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Register</span>
              </span>
              {activeTab === "register" && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
              )}
            </button>
          </div>

          {/* Enhanced Form with better spacing and animations */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Enhanced Username Field with icon */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 text-gray-900 bg-gray-50/50 focus:bg-white shadow-sm"
                    placeholder="Enter your username"
                    aria-label="Enter your username"
                  />
                </div>
              </div>

              {/* Enhanced Email Field (Register only) with icon */}
              {activeTab === "register" && (
                <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 text-gray-900 bg-gray-50/50 focus:bg-white shadow-sm"
                      placeholder="Enter your email address"
                      aria-label="Enter your email address"
                    />
                  </div>
                </div>
              )}

              {/* Enhanced Password Field with show/hide toggle */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    required
                    className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 text-gray-900 bg-gray-50/50 focus:bg-white shadow-sm"
                    placeholder="Enter your password"
                    aria-label="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:text-blue-500 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {/* Password strength indicator for register */}
                {activeTab === "register" && (
                  <div className="mt-2">
                    <div className="flex space-x-1">
                      <div className="h-1 w-full bg-gray-200 rounded-full">
                        <div className="h-1 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full w-1/3"></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Use 8+ characters with a mix of letters, numbers & symbols</p>
                  </div>
                )}
              </div>

              {/* Enhanced Error Message with better styling */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Submit Button with better loading state and animations */}
              <button
                type="submit"
                disabled={loginMutation.isPending || registerMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/25 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                aria-label={activeTab === "login" ? "Sign in to your account" : "Create new account"}
              >
                {(loginMutation.isPending || registerMutation.isPending) ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{activeTab === "login" ? "Sign In" : "Create Account"}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Additional Action Links */}
              {activeTab === "login" && (
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-500 font-medium transition-colors focus:outline-none focus:underline"
                    aria-label="Forgot your password"
                  >
                    Forgot Password?
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors focus:outline-none focus:underline"
                    aria-label="Create new account"
                  >
                    Create Account
                  </button>
                </div>
              )}
            </form>

            {/* Enhanced Demo Credentials with better visual hierarchy */}
            {activeTab === "login" && (
              <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-2xl border border-gray-200/50 animate-in slide-in-from-bottom-2 duration-500 delay-300">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-gray-800">Demo Credentials</p>
                    <p className="text-xs text-gray-500">Use these credentials to test the application</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200/50 hover:border-blue-200 transition-colors group cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">👨‍💼</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Admin Account</p>
                        <p className="text-xs text-gray-500">admin / admin123</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200/50 hover:border-blue-200 transition-colors group cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">👤</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Demo User</p>
                        <p className="text-xs text-gray-500">demo / demo123</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200/50 hover:border-blue-200 transition-colors group cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">📊</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Manager</p>
                        <p className="text-xs text-gray-500">manager / manager123</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Footer with additional links */}
        <div className="text-center mt-8 animate-in fade-in duration-700 delay-500">
          <p className="text-sm text-gray-500 mb-4">
            © 2024 WarehousePro. All rights reserved.
          </p>
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
            <a href="#" className="hover:text-blue-600 transition-colors focus:outline-none focus:underline">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors focus:outline-none focus:underline">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 transition-colors focus:outline-none focus:underline">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
