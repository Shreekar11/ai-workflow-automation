"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <main className="relative pt-32 md:pt-40">
        <AnimatedGridPattern
          width={40}
          height={40}
          className={cn(
            "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
            "absolute inset-0 h-full opacity-50"
          )}
          numSquares={100}
          maxOpacity={0.1}
          duration={3}
          repeatDelay={1}
        />
        <div className="container relative z-10 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-start">
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6"
              initial={{ filter: "blur(8px)", opacity: 0 }}
              animate={{ filter: "blur(0px)", opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span className="text-[#FF7801]">Workflow</span> is a
              purpose-built tool for automating and streamlining your processes
            </motion.h1>
            <motion.p
              className="sm:text-xl text-gray-600 text-sm mb-8"
              initial={{ filter: "blur(8px)", opacity: 0 }}
              animate={{ filter: "blur(0px)", opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Meet the system for modern task management. Optimize workflows,
              projects, and team collaboration.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button
                size="lg"
                onClick={() => router.push("/sign-in")}
                className="w-full sm:w-auto bg-[#FF7801] text-white hover:bg-[#FF7801]/90"
              >
                Start Worflow
              </Button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
