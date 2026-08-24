import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Montserrat } from "next/font/google";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageTransition } from "@/components/motion/PageTransition";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { absoluteUrl, ogImage } from "@/lib/seo";
import { site } from "@/lib/site";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#00206F",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  keywords: [
    "TechUp Academy",
    "tech bootcamp Nigeria",
    "free coding bootcamp",
    "digital skills training",
    "web development course",
    "UI UX design Nigeria",
    "data analytics course",
    "tech scholarship Nigeria",
  ],
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: site.name,
    description: site.description,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: [ogImage.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    apple: [{ url: "/favicon.ico" }],
  },
  category: "education",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col overflow-x-hidden font-sans">
        <MetaPixel />
        <OrganizationJsonLd />
        <SiteHeader />
        <main className="flex flex-1 flex-col">
          <PageTransition>{children}</PageTransition>
        </main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
