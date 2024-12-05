import type { Metadata } from "next";
import "./globals.css";
import { Auth, GlobalConfig, QaBadge } from "@/components";
import Script from "next/script";

export const metadata: Metadata = {
    title: "nx-toolbox",
    description: "nx-toolbox app",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <Script async src="https://kit.fontawesome.com/41b303a8d1.js" crossOrigin="anonymous" />
            </head>
            <body className={`w-dvw h-dvh bg-cover bg-center`} style={{ backgroundImage: "url('/images/login-bg.png')" }}>
                <Auth />
                <GlobalConfig />
                {children}
            </body>
        </html>
    );
}
