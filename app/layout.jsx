import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "./provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "HireEva",
  description: "Created by Sumplyhired",
  icons: {
    icon: "/favicon-32x32.png",
  },
};

const clerkLocalization = {
  signIn: {
    start: {
      title: "Welcome back",
      subtitle: "Sign in to continue to your account",
    },
  },
  signUp: {
    start: {
      title: "Create your account",
      subtitle: "Start hiring smarter with HireEva",
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={clerkLocalization}>
      <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Provider>{children}</Provider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
