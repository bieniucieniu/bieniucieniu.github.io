import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { Spotlight } from "@/components/ui/client";

const lato = Lato({ subsets: ["latin-ext"], weight: ["400", "700", "900"] });

export const metadata: Metadata = {
  title: "Mikolaj Bien",
  description: "junior front-end dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="scroll-smooth" lang="en">
      <body className={lato.className}>
        <div className={"relative min-h-screen bg-slate-900 text-slate-200"}>
          <Spotlight withToggle className="fixed inset-0" />
          {children}
        </div>
      </body>
    </html>
  );
}
