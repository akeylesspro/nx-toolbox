import { cookies } from "next/headers";
import { fetchNotActiveCars } from "./helpers";
import NotActiveDevices from "./NotActiveDevices";
import { TObject } from "akeyless-types-commons";

export default async function NotActiveDevicesPage() {
    const cookiesList = await cookies();
    const token = cookiesList.get("token")?.value;
    const filterFun = (val: TObject<any>) => {
        return (!val.last_location || val.last_location.days_passed > 1) && !val.deactivated;
    };
    const data = (await fetchNotActiveCars(token)).filter(filterFun);
    console.log("data", data);

    return <NotActiveDevices data={data} />;
}

export const dynamic = "force-dynamic";
