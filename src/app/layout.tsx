import type { Metadata } from "next";
import { Inter, Noto_Serif } from "next/font/google";

export const dynamic = "force-dynamic";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { getUserMetaServer } from "@/lib/user-meta";
import ProfileHydrator from "@/components/common/ProfileHydrator";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Lumina Ethereal | Secure Philanthropy",
  description:
    "A bespoke subscription platform for the digital philanthropist.",
};

import { Providers } from "@/components/Providers";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = createClient();
  await supabase.auth.getUser();
  const meta = await getUserMetaServer();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSerif.variable} antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-[#faf9f7] text-[#0f1523]"
        suppressHydrationWarning
      >
        <Providers>
          <ProfileHydrator meta={meta} />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
