import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.quantbagel.xyz"),
  title: "Lucas Miranda — quantbagel",
  description: "Building Abstract — compute and physical AI.",
  alternates: { canonical: "/" },
  openGraph: { title: "Lucas Miranda — quantbagel", description: "Building Abstract — compute and physical AI.", url: "https://www.quantbagel.xyz", type: "website" },
  twitter: { card: "summary", creator: "@quantbagel" },
  icons: { icon: "/icon.svg" },
};
export const viewport: Viewport = { themeColor: "#000000", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
