import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "../styles/globals.css"; // Adjust path if your globals.css is elsewhere

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Restore Photos AI", // Youcan change this to your app's title
  description: "Restore your old photos with AI", // You can change this
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {/* You can add a header here with SignedIn, SignedOut, UserButton, etc. */}
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}