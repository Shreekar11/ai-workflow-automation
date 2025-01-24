"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// icons
import { ArrowRight, CheckCircle } from "lucide-react";

// components
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";

export default function Page() {
  const router = useRouter();

  const features = [
    "Automate repetitive tasks",
    "Streamline complex processes",
    "Reduce human errors",
    "Increase productivity",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-900">
      <Navbar />
      <main className="pt-32 md:pt-40 flex justify-center items-center">
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
        <div className="container relative z-10 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6"
              initial={{ filter: "blur(8px)", opacity: 0, y: -20 }}
              animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span className="text-[#FF7801]">Workflow</span> automation for{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF7801] to-[#FFA500]">
                effortless efficiency
              </span>
            </motion.h1>
            <motion.p
              className="sm:text-xl text-gray-600 text-sm mb-8 max-w-2xl mx-auto"
              initial={{ filter: "blur(8px)", opacity: 0 }}
              animate={{ filter: "blur(0px)", opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Revolutionize your business processes. Automate workflows,
              eliminate bottlenecks, and boost productivity with our
              cutting-edge automation platform.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button
                size="lg"
                onClick={() => router.push("/workflows")}
                className="w-full sm:w-auto bg-[#FF7801] text-white hover:bg-[#FF7801]/90 transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                Start Automating <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                >
                  <CheckCircle className="h-5 w-5 text-[#FF7801]" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
