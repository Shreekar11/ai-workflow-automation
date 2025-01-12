"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <header className="fixed top-0 w-full z-50 my-4">
      <div className="max-w-3xl mx-auto border bg-white/50 backdrop-blur-sm border-[#FF7801]/30 px-2 py-2 rounded-xl container flex items-center justify-center">
        <nav className="flex justify-between w-full items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold text-[#FF7801]"
            >
              Workflow
            </motion.span>
          </Link>
          <div className="flex justify-center items-center gap-2">
            <Link href="/sign-in">
              <Button
                variant="ghost"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Log in
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                variant="default"
                className="text-sm bg-[#FF7801] text-white hover:bg-[#FF7801]/90"
              >
                Sign up
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
