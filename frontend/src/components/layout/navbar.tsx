"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Image from "next/image";

export function Navbar() {
  const { isSignedIn } = useUser();
  const pathName = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "py-2" : "py-4"
      }`}
    >
      <div
        className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md shadow-md"
            : "bg-transparent"
        } rounded-full transition-all duration-300`}
      >
        <nav className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* {pathName === "/" ? (
                <span className="text-2xl font-bold text-[#FF7801]">
                  Workflow
                </span>
              ) : ( */}
                <Image
                  src="/assets/logo.png"
                  alt="logo"
                  width={50}
                  height={50}
                  layout="fixed"
                  quality={100}
                />
              {/* )} */}
            </motion.div>
          </Link>

          {isSignedIn ? (
            <UserButton />
          ) : (
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  variant="default"
                  className="bg-[#FF7801] text-white hover:bg-[#FF7801]/90 transition-all duration-200 transform hover:scale-105"
                >
                  Sign up
                </Button>
              </Link>
            </div>
          )}

          <div className="md:hidden">
            {isSignedIn ? (
              <UserButton />
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            )}
          </div>
        </nav>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-2"
            >
              <div className="flex flex-col space-y-2 px-4 py-6 border border-[#FF7801]/30 rounded-xl bg-white/50 backdrop-blur-sm">
                <Link href="/sign-in">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    Log in
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    variant="default"
                    className="bg-[#FF7801] text-white hover:bg-[#FF7801]/90 transition-all duration-200"
                  >
                    Sign up
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
