"use client";
import { PopupsStore } from "@/lib/store";
import React, { useEffect } from "react";
import Popup from ".";

export default function PopupsManager() {
    const popups = PopupsStore.popups();
    const addPopup = PopupsStore.addPopup();
    useEffect(() => {
        addPopup({ id: "test", element: <Test id="" /> });
        addPopup({ id: "test2", element: <Test id="2" /> });
        addPopup({ id: "test3", element: <Test id="3" /> });
        addPopup({ id: "test4", element: <Test id="4" />, resize: false });
        addPopup({ id: "test5", element: <Test id="5" />, resize: false });
        addPopup({ id: "test6", element: <Test id="6" />, resize: false });
    }, []);
    return (
        <>
            {popups.map((popupData) => {
                return <Popup key={popupData.id} {...popupData} />;
            })}
        </>
    );
}

const Test = ({ id }: { id: string }) => {
    console.log("rendering test", id);
    return <div className="">hello from test {id} </div>;
};
