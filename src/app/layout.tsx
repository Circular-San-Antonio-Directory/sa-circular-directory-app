import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/globals.scss";
import "mapbox-gl/dist/mapbox-gl.css";
import Script from 'next/script';
import { Banner } from '@/components/Banner';
import { SITE_URL } from "@/lib/siteUrl";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ROOT_DESCRIPTION =
  "Directory of San Antonio circular economy businesses — donate, buy, thrift, repair, recycle, refill, rent, and more. Find local shops and services that keep materials in use.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SA Circular Directory — San Antonio Circular Economy Businesses",
    template: "%s · SA Circular Directory",
  },
  description: ROOT_DESCRIPTION,
  applicationName: "SA Circular Directory",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "SA Circular Directory",
    locale: "en_US",
    url: "/",
    title: "SA Circular Directory — San Antonio Circular Economy Businesses",
    description: ROOT_DESCRIPTION,
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "SA Circular Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SA Circular Directory — San Antonio Circular Economy Businesses",
    description: ROOT_DESCRIPTION,
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'bBHtBN3wcF2yPksHhC73yv7NiSjfWspunucfW5W5o-I',
  },
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Banner dismissable />
        {children}
        {modal}
        <Script src="https://kit.fontawesome.com/d951ac1750.js" crossOrigin="anonymous" strategy="afterInteractive" />
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `}</Script>
          </>
        )}
      </body>
    </html>
  );
}
