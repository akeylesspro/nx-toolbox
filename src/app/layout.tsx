import type { Metadata } from "next";
import "./globals.css";
import { Auth, GlobalConfig, QaBadge } from "@/components";

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
            <body className={`w-dvw h-dvh bg-cover bg-center`} style={{ backgroundImage: "url('/images/login-bg.png')" }}>
                <Auth />
                <GlobalConfig />
                <QaBadge />
                {children}
            </body>
        </html>
    );
}
