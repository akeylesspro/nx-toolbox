import React from "react";
import { isEqual } from "lodash";
import { TObject } from "akeyless-types-commons";
import { Position } from "@/types";

interface PopupWrapperProps {
    element: React.ReactElement;
    position: Position;
    exitPopUp: () => void | Promise<void>;
}

const PopupWrapper = ({ element, position, exitPopUp }: PopupWrapperProps) => {
    if (React.isValidElement<{ position: Position; exitPopUp: () => void }>(element) && typeof element.type !== "string") {
        return React.cloneElement(element, { position, exitPopUp });
    }
    return element;
};

const areEqual = (prevProps: TObject<any>, nextProps: TObject<any>) => {
    const { position: prevPosition, ...prevOtherProps } = prevProps;
    const { position: nextPosition, ...nextOtherProps } = nextProps;
    return isEqual(prevOtherProps, nextOtherProps);
};

const Warper = React.memo<PopupWrapperProps>(PopupWrapper, areEqual);
Warper.displayName = "PopupWarper";
export default Warper;
