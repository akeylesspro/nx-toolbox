import { cookies } from "next/headers";
import { fetchNotActiveCars } from "./helpers";
import NotActiveDevices from "./NotActiveDevices";

export default async function NotActiveDevicesPage() {
    const cookiesList = await cookies();
    const token = cookiesList.get("token")?.value;
    const data = await fetchNotActiveCars(token);
    return <NotActiveDevices data={data} />;
}

export const dynamic = "force-dynamic";
