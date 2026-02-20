// app/layout.tsx 

import Footer from "@/src/components/Share/Footer/Footer";
import Navbar from "@/src/components/Share/Navigation/Navbar/Navbar";
import TopNavbar from "@/src/components/TopNavbar/TopNavbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <TopNavbar />
      <Navbar />

    

      <main className=" lg:pt-32">
        {children}
      </main>
      <Footer />
    </div>
  );
}