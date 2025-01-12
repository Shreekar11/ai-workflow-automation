import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";

const everett = localFont({
  src: "../../public/font/TWKEverett-Regular.woff2",
  weight: "400",
  style: "normal",
});

export const metadata: Metadata = {
  title: "Automate your Workflows",
  description: "Workflow is a purpose-built tool for automating and streamlining your processes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ClerkProvider
        appearance={{
          variables: {
            colorPrimary: "#FF7801",
          },
        }}
      >
        <body className={everett.className}>{children}</body>
      </ClerkProvider>
    </html>
  );
}
