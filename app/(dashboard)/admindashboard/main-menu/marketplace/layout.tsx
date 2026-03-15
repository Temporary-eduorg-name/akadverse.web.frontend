import type { Metadata } from "next";
import "./globals.css";
import "./carousel.css";
import LayoutClient from "./LayoutClient";

export const metadata: Metadata = {
  title: "Admin Marketplace",
  description: "A marketplace for students to buy and sell services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="antialiased flex flex-col min-h-screen">
      <LayoutClient>{children}</LayoutClient>
    </div>
  );
}
