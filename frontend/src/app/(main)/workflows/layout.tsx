import "../../globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";

export const metadata: Metadata = {
  title: "Workflow Dashboard - View your workflows and templates",
  description:
    "Unlock seamless productivity with workflow automation platform. Streamline complex processes, reduce manual tasks, and boost team efficiency across all business operations.",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main>{children}</main>;
}
