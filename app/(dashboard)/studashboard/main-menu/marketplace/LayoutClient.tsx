"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/src/Navbar";
import Footer from "@/src/Footer";
import { AuthProvider } from "@/src/context/AuthContext";

export default function LayoutClient({children}: { children: React.ReactNode;}) {
  const pathname = usePathname();
  
  const hideNavFooter = [
    "/studashboard/main-menu/marketplace/add-business", 
    "/studashboard/main-menu/marketplace/add-skill", 
    "/studashboard/main-menu/marketplace/signup", 
    "/studashboard/main-menu/marketplace/login"
  ].includes(pathname);

  return (
    <AuthProvider>
      {!hideNavFooter && <Navbar />}
      {children}
      {!hideNavFooter && <Footer />}
    </AuthProvider>
  );
}
