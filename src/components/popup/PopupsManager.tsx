"use client";
import { PopupsStore } from "@/lib/store";
import React, { useEffect } from "react";
import Popup from ".";

export default function PopupsManager() {
    const popups = PopupsStore.popups();
    const addPopup = PopupsStore.addPopup();
    useEffect(() => {
        for (let i = 0; i < 35; i++) {
            addPopup({
                id: `test${i}`,
                type: "info",
                element: <Test id={i.toString()} />,
                resize: true,
                minimize: { enable: true },
                maximize: { enable: true },
            });
        }
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
