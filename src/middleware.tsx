import { NextRequest, NextResponse } from "next/server";
import { baseUrl } from "./lib/helpers/global";

export default async function authMiddleware(request: NextRequest) {
    // health check for Google Cloud
    const userAgent = request.headers.get("user-agent");
    if (userAgent === "GoogleHC/1.0") {
        return new NextResponse("OK", { status: 200 });
    }
    // auth check
    const token = request.cookies.get("token")?.value;
    const requestAUthenticated = !!token;

    if (!requestAUthenticated) {
        if (request.nextUrl.pathname.startsWith("/api")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        } else {
            console.error("request not authenticated, redirecting to login");
            return NextResponse.redirect(`${baseUrl()}/login`);
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/", "/boards", "/reports", "/users", "/clients", "/api/cache"],
};
