import { MouseEvent } from "react";

export const getClickLocation = (e: MouseEvent) => {
    const container = e.currentTarget.closest(".popupManager");
    if (!container) return { top: `50%`, left: `30%` };

    const containerRect = container.getBoundingClientRect();
    const clickX = e.clientX - containerRect.left;
    const clickY = e.clientY - containerRect.top;

    const percentX = (clickX / containerRect.width) * 100;
    const percentY = (clickY / containerRect.height) * 100;
    return { top: `${percentY + 2}%`, left: `${percentX}%` };
};
