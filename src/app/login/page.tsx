import Login from "./Login";

export default async function LoginPage() {
    return <Login />;
}

export const dynamic = "force-dynamic";

export const config = {
    runtime: "nodejs",
};
