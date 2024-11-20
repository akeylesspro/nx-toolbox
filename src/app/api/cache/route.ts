import { getCookie } from "cookies-next";
import { NextRequest, NextResponse } from "next/server";
import { verify_token } from "akeyless-server-commons/helpers";
export const config = {
    runtime: "nodejs",
};

export async function GET(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
        return NextResponse.json({ success: false });
    }
    const user = await verify_token("bearer " + token);
    console.log("User from cache", user);

    return NextResponse.json({ success: true, user });
}
