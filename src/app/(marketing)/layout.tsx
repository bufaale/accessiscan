import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { StructuredData } from "@/components/landing/structured-data";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <StructuredData />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
