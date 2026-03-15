import type { Metadata } from "next";
import "./globals.css";
import "./carousel.css";
import LayoutClient from "./LayoutClient";

export const metadata: Metadata = {
  title: "Student Marketplace",
  description: "A marketplace for students to buy and sell services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LayoutClient>{children}</LayoutClient>
  );
}
