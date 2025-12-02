import Navbar from "@/src/components/Navbar/Navbar";
import TopNavbar from "@/src/components/TopNavbar/TopNavbar";



export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNavbar />
      <Navbar />
      <main className="flex-grow">{children}</main>

    </div>
  );
}
