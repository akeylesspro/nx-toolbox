import { NextRequest, NextResponse } from "next/server";
import { baseUrl } from "./lib/helpers/global";

export default async function authMiddleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    console.log("request authenticated: ", !!token);

    if (!token) {
        if (request.nextUrl.pathname.startsWith("/api")) {
            console.error("Access denied to API: request not authenticated");
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        if (request.nextUrl.pathname !== "/login") {
            console.error("request not authenticated, redirecting to login");
            return NextResponse.redirect(`${baseUrl()}/login`);
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/", "/boards", "/test", "/api/cache"],
};
