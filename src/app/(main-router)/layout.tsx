import Aside from "@/components/Aside";

export default async function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="_full flex p-1 h-screen ">
            <Aside />
            <div className="flex-grow flex children_container">{children}</div>
        </div>
    );
}
