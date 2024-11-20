import { Login } from "@/appPages";

export default function LoginPage() {
    return <Login />;
}

export const dynamic = "force-dynamic";

export const config = {
    runtime: "nodejs",
};
