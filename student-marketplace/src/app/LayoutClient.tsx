"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

export default function LayoutClient({children}: { children: React.ReactNode;}) {
  const pathname = usePathname();
  
  const hideNavFooter = ["/add-business", "/add-skill", "/signup", "/login"].includes(
    pathname
  );

  return (
    <AuthProvider>
      {!hideNavFooter && <Navbar />}
      {children}
      {!hideNavFooter && <Footer />}
    </AuthProvider>
  );
}
