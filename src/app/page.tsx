"use client";

import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { setupDemoUser } from "@/utils/userSetup";
import { createClient } from "../../supabase/client";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    setupDemoUser();
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const name = user.user_metadata?.full_name || user.user_metadata?.first_name || user.email?.split('@')[0];
        setUserName(name);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  return (
    <LanguageProvider>
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
    </LanguageProvider>
  );
}