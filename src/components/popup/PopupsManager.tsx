"use client";
import { PopupsStore } from "@/lib/store";
import React, { useEffect } from "react";
import Popup from ".";

export default function PopupsManager() {
    const popups = PopupsStore.popups();
    const addPopup = PopupsStore.addPopup();
    // test popups
    useEffect(() => {
        addPopup({
            id: `test1`,
            type: "info",
            element: <Test text={"minimize"} />,
            minimize: { enable: true },
        });
        addPopup({
            id: `test2`,
            type: "info",
            element: <Test text={"maximize"} />,
            maximize: { enable: true },
            top:"264px",
        });
        addPopup({
            id: `test3`,
            type: "info",
            element: <Test text={"maximize and maximize"} />,
            maximize: { enable: true },
            minimize: { enable: true },
            top:"420px",
        });
        addPopup({
            id: `test4`,
            type: "info",
            element: <Test text={"resize"} />,
            resize: true,
            right:"780px"
            
        });
        addPopup({
            id: `test5`,
            type: "info",
            element: <Test text={"non-closing"} />,
            close: { noClose: true },
            top:"264px",
            right:"100px"
        });
        addPopup({
            id: `test6`,
            type: "info",
            right: "100px",
            element: <Test text={"undraggable"} />,
            dragAndDrop: false,
        });
    }, []);
    return (
        <>
            {popups.map((popupData) => {
                return <Popup key={popupData.id} {...popupData} />;
            })}
        </>
    );
}

const Test = ({ text }: { text: string }) => {
    console.log("rendering test", text);
    return <div className="">{text} </div>;
};
