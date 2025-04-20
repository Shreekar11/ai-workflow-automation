import "../globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toaster";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const everett = localFont({
  src: "../../../public/font/TWKEverett-Regular.woff2",
  weight: "400",
  style: "normal",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main
      className={`${everett.className} h-scren bg-gradient-to-b from-white to-gray-100`}
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        {children}
        <Toaster />
      </SidebarProvider>
    </main>
  );
}
