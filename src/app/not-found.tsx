import { Button } from "@/components";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="text-black _full flex flex-col justify-center items-center gap-2">
            <h2>Not Found</h2>
            <p>Could not find requested resource</p>

            <Button variant={"default"} className="p-0">
                <Link className="_full p-2" href="/">
                    Home
                </Link>
            </Button>
        </div>
    );
}
