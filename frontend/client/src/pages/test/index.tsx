import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

// Simple test page to verify the frontend is working
export default function TestPage() {
  const [message, setMessage] = useState("Frontend is working!");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Test Page</h1>
            <p className="text-muted-foreground">
              This page tests if the frontend is working correctly
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <p className="text-green-600 font-medium">{message}</p>
          
          <div className="mt-4">
            <button 
              onClick={() => setMessage("Button click works!")}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Test Button
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
