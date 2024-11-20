import { AsideButton, ClickableLogo, Logout } from "./global";
import { Button } from "./ui";

function Aside() {
    return (
        <aside className="w-96 flex flex-col justify-between gap-2 py-2 border-r-2 border-black">
            <div className="w-full _center  h-16">
                <ClickableLogo />
            </div>
            <div className="w-full px-4 py-2 flex flex-col gap-2   flex-1">
                <AsideButton content="boards" to="/boards" disabled />
            </div>
            <div className="h-10  ">
                <Logout />
            </div>
        </aside>
    );
}

export default Aside;
