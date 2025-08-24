"use client";

import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { setupDemoUser } from "@/utils/userSetup";

export default function HomePage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    setupDemoUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.first_name || user?.email?.split('@')[0];

  return (
    <>
      <Navbar />
      {user && userName && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4">
          <div className="container mx-auto px-4">
            <p className="text-center text-lg">
              Welcome back, <span className="font-semibold">{userName}</span>! 👋
            </p>
          </div>
        </div>
      )}
      <Hero />
      <Footer />
    </>
  );
}