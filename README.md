add popup example :

import { PopupsStore } from "@/lib/store";

const AddPopupComponent ()=>{
const addPopup = PopupsStore.addPopup();

    useEffect(() => {
        addPopup({
            id: `test1`,
            type: "info",
            element: <Test text={"maximize and minimize"} />,
            maximize: { enabled: true },
            minimize: { enabled: true },
            resize: true,
            headerIcon: <i className="fa-regular fa-user mx-1 "></i>,
            headerTitle: "test1",
        })
    }, [addPopup]);

    return <></>
}

const Test = ({ text }: { text: string }) => {
    return <div>{text}</div>;
};
