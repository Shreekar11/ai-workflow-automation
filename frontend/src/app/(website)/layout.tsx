import "../globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";

const everett = localFont({
  src: "../../../public/font/TWKEverett-Regular.woff2",
  weight: "400",
  style: "normal",
});

export const metadata: Metadata = {
  title: {
    default: "Automate your Workflows | Streamline Processes Efficiently",
    template: "%s | Workflow Automation Platform",
  },
  description:
    "Workflow: The ultimate purpose-built tool for automating and streamlining business processes. Boost productivity, reduce errors, and optimize your workflow.",
  metadataBase: new URL("https://workflows-flax.vercel.app/"),
  openGraph: {
    title: "Automate your Workflows | Workflow Automation Platform",
    description:
      "Streamline your business processes with our powerful workflow automation tool.",
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Workflow Automation",
    images: [
      {
        url: `https://storage.googleapis.com/${process.env.NEXT_PUBLIC_BUCKET_NAME}/532c6f10-a642-4828-8f58-39790af43925.png`,
        width: 1200,
        height: 630,
        alt: "Workflow Automation Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Automate your Workflows | Workflow Automation Platform",
    description:
      "Streamline your business processes with our powerful workflow automation tool.",
    images: [
      `https://storage.googleapis.com/${process.env.NEXT_PUBLIC_BUCKET_NAME}/532c6f10-a642-4828-8f58-39790af43925.png`,
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className={everett.className}>{children}</main>;
}
