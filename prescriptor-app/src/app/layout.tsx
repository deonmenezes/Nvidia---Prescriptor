import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prescriptor.ai — Doctor Dashboard",
  description: "AI-powered patient management and reminder system for healthcare professionals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
