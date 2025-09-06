"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  Rocket,
  RocketIcon,
  Target,
  TrendingUp,
  User,
  Globe,
  Users,
  BookMarked,
  Award,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function Hero() {
  const { t } = useLanguage();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Get user name from localStorage or other auth state
    const savedUserName = localStorage.getItem("userName");
    if (savedUserName) {
      setUserName(savedUserName);
    }
  }, []);

  const features = [
    {
      icon: Rocket,
      title: t("hero.whyChooseUs"),
      description: t("hero.whyChooseUsSubtitle"),
    },
    {
      icon: BookOpen,
      title: "Detailed Roadmaps",
      description:
        "Get step-by-step guidance from high school to career for your chosen field.",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description:
        "Monitor your academic journey and celebrate milestones along the way.",
    },
  ];

  const stats = [
    { number: "20+", label: "College Majors and Submajors", icon: BookMarked, color: "from-blue-500 to-indigo-600" },
    { number: "600+", label: "Students Helped", icon: Users, color: "from-green-500 to-emerald-600" },
    { number: "25+", label: "Countries using our platform", icon: Globe, color: "from-purple-500 to-violet-600" },
    { number: "100+", label: "Free resources and guides", icon: Award, color: "from-orange-500 to-red-600" },
  ];

  // Country codes data for stats section animation
  const countryCodes = [
    "US", "MX", "CA", "AU", "DE", "FR", "JP", "KR", "IN", "BR", 
    "ES", "IT", "NL", "SE", "NO", "DK", "FI", "CH", "AT", "BE", 
    "IE", "PT", "RU", "CN", "GB", "AR", "CL", "CO", "PE", "VE"
  ];

  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" });

  return (
    <div className="relative overflow-hidden bg-white">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 opacity-80" />
      

      <div className="relative">
        {/* Hero Section */}
        <div className="pt-32 pb-20 sm:pt-40 sm:pb-24">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <motion.h1
                className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  {t("hero.title")}
                </span>
              </motion.h1>
              <motion.p
                className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                {t("hero.subtitle")}
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              >
                <Link href="/assessment" prefetch={true}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {t("hero.startAssessment")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/majors" prefetch={true}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 text-lg font-semibold rounded-full transition-all duration-300"
                    >
                      {t("hero.browseMajors")}
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className="py-20 bg-gradient-to-r from-gray-50 to-white relative overflow-hidden" ref={statsRef}>
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-100/30 to-blue-100/30" />
          
          {/* Animated Country Codes Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* First row moving right */}
            <motion.div
              className="absolute top-8 flex space-x-8 whitespace-nowrap"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {countryCodes.slice(0, 15).map((code, index) => (
                <motion.div
                  key={index}
                  className="text-sm font-bold text-purple-300/40 hover:text-purple-400/60 transition-colors duration-300"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: [0.9, 1.1, 0.9] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.2,
                  }}
                >
                  {code}
                </motion.div>
              ))}
            </motion.div>
            
            {/* Second row moving left */}
            <motion.div
              className="absolute bottom-8 flex space-x-8 whitespace-nowrap"
              animate={{
                x: ['100%', '-100%'],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {countryCodes.slice(15).map((code, index) => (
                <motion.div
                  key={index}
                  className="text-sm font-bold text-blue-300/40 hover:text-blue-400/60 transition-colors duration-300"
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                >
                  {code}
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Trusted by Students Worldwide
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join thousands of students who have discovered their perfect career path
              </p>
            </motion.div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={isStatsInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      rotateY: 5,
                      transition: { duration: 0.2 }
                    }}
                    className="text-center group cursor-pointer"
                  >
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-purple-200">
                      {/* Icon with gradient background */}
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      
                      {/* Number with counter animation */}
                      <motion.div
                        className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2"
                        initial={{ scale: 0 }}
                        animate={isStatsInView ? { scale: 1 } : {}}
                        transition={{ 
                          duration: 0.5, 
                          delay: index * 0.1 + 0.3,
                          type: "spring",
                          stiffness: 200
                        }}
                      >
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                          {stat.number}
                        </span>
                      </motion.div>
                      
                      <div className="text-gray-600 font-medium leading-tight">
                        {stat.label}
                      </div>
                      
                      {/* Hover indicator */}
                      <motion.div
                        className="w-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto mt-3 group-hover:w-full transition-all duration-300"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {t("hero.whyChooseUs")}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t("hero.whyChooseUsSubtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ y: -10 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm h-full">
                    <CardHeader className="text-center pb-4">
                      <motion.div
                        className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <feature.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <CardTitle className="text-xl font-bold text-gray-900">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600 text-center leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div className="py-20 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full"
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />
            <motion.div
              className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/10 rounded-full"
              animate={{ 
                y: [-20, 20, -20],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ duration: 5, repeat: Infinity, delay: 2 }}
            />
          </div>
          
          <div className="container mx-auto px-4 text-center relative">
            <motion.h2
              className="text-3xl sm:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {t("hero.readyToStart")}
            </motion.h2>
            <motion.p
              className="text-xl mb-10 max-w-2xl mx-auto opacity-90"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {t("hero.readyToStartSubtitle")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link href="/assessment" prefetch={true}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {t("hero.getStarted")}
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
