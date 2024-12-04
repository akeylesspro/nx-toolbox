import Aside from "@/components/Aside";
import InitialCache from "@/components/config/InitialCache";
import { PopupManager } from "@/components/popup/comps";

export default async function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="_full flex p-1 h-screen ">
            <InitialCache />
            <Aside />
            <div className="flex-grow flex children_container relative">
                {children}
                <PopupManager />
            </div>
        </div>
    );
}
