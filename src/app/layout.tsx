import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./contexts/UserContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Purkosa Parts",
  description: "Car Parts Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}

//Email:
//email: purkosaparts@gmail.com
//password: greatParts48##

//Supabase:
//email: purkosaparts@gmail.com
//password: bigParts48##
//db password: PartsDB48##%

//Cloudflare R2:
//email: purkosaparts@gmail.com
//password: bigParts48##

//Resend:
//email: purkosaparts@gmail.com
//password: bigParts48##