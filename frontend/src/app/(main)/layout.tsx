import { Toaster } from "@/components/ui/toaster";
import "../globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";

const everett = localFont({
  src: "../../../public/font/TWKEverett-Regular.woff2",
  weight: "400",
  style: "normal",
});

export const metadata: Metadata = {
  title: "Workflow Dashboard",
  description:
    "Workflow is a purpose-built tool for automating and streamlining your processes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className={`${everett.className} bg-[#FBF8F6]`}>
      {children}
      <Toaster />
    </main>
  );
}
