import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./contexts/UserContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
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


//TODO: 
//Finish sign up page - done
//Clean up parts + vehicles listed - done
//Deploy to vercel - done
//Fix filters (add interface for each part + filter button at the bottom that triggers filtering) - done
//Add my parts - done
//Finish wheels page - done
//Make parts and wheels in vehicle page clickable
//Add seller details on part
//Look through entire web app to find bugs
//Add smart lookup feature