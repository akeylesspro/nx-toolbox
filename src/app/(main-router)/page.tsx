import { HomePageMessage } from "@/components";
export const dynamic = "force-dynamic";

export default async function Home() {
    
    return (
        <div className="w-full h-full _center">
            <HomePageMessage />
        </div>
    );
}
