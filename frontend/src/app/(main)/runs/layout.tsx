import "../../globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workflow Runs - View your previous workflow and tempalte runs",
  description:
    "Unlock seamless productivity with workflow automation platform. Streamline complex processes, reduce manual tasks, and boost team efficiency across all business operations.",
};

export default function RunLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="w-full">{children}</main>;
}
