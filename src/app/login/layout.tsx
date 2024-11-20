import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "login",
    description: "login page",
};

export default async function LoginLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <div className="_full">{children}</div>;
}
