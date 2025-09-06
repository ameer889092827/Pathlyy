"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "../../supabase/client";
import { Button } from "./ui/button";
import { UserCircle, User } from "lucide-react";
import UserProfile from "./user-profile";
import LanguageSwitcher from "./language-switcher";
import NavbarLinksClient from "./navbar-links-client";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

export default function Navbar() {
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const savedUserName = localStorage.getItem("userName");
    if (savedUserName) {
      setUserName(savedUserName);
    }

    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (user) {
        setUserEmail(user.email ?? null);
        const name = (user.user_metadata as any)?.full_name ?? null;
        setUserName(name);
        if (name) {
          localStorage.setItem("userName", name);
        }
      } else {
        setUserEmail(null);
        setUserName(null);
        localStorage.removeItem("userName");
      }
    });
  }, [supabase]);

  return (
    <motion.nav 
      className="w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm py-2 sticky top-0 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Link href="/" prefetch={true} className="text-xl font-bold text-purple-600">
            Pathly
          </Link>
        </motion.div>
        
        <NavbarLinksClient />
        <LanguageSwitcher />
        
        <motion.div 
          className="flex gap-4 items-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {userEmail ? (
            <>
              {userName && (
                <motion.div 
                  className="hidden md:flex items-center text-sm text-gray-600 mr-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <User className="w-4 h-4 mr-2 text-purple-600" />
                  {t("nav.welcome")}, <span className="font-medium text-purple-600 ml-1">{userName}</span>
                </motion.div>
              )}
              <UserProfile />
            </>
          ) : (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/sign-in"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                >
                  Sign In
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(147, 51, 234, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  href="/sign-up"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </motion.nav>
  );
}