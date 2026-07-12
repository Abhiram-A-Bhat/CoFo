import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "CoFo",
  description: "Pitch-perfect connections for founders and investors"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen overflow-x-hidden">{children}</body>
    </html>
  );
}
