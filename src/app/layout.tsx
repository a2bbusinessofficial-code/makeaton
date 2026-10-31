import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Brightloop — Subscriptions", template: "%s · Brightloop" },
  description: "Plans, subscriptions, recurring billing, payments and revenue in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
