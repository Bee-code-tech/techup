import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Montserrat, Geist } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { absoluteUrl, ogImage } from "@/lib/seo";
import { site } from "@/lib/site";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("h-full", "antialiased", montserrat.variable, "font-sans", geist.variable)}>
      <body className="flex min-h-full flex-col overflow-x-hidden font-sans">
        <GoogleAnalytics />
        <MetaPixel />
        <OrganizationJsonLd />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
