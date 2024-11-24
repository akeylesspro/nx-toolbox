import { fire_base_TIME_TEMP, get_all_documents, get_document_by_id, set_document, simpleExtractData } from "akeyless-client-commons/helpers";
import { Board, TObject } from "akeyless-types-commons";
import { useCallback, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import QRCodeGenerator from "qrcode";

export const usePrintQR = (board: Board) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: containerRef,
        bodyClass: "",
        documentTitle: "QR Code",
    });

    const generateQRCodeImage = useCallback(async () => {
        let token: string;
        if (board.token) {
            token = board.token;
            console.log("no update token");
        } else {
            token = [...board.id].reverse().join("");
            await set_document("boards", board.id, { token, update: fire_base_TIME_TEMP() });
            console.log("update board token success");
        }

        const canvas = document.createElement("canvas");

        QRCodeGenerator.toCanvas(canvas, `https://installerapp.online/camera_installation/${token}`, { width: 250 }, (error) => {
            if (error) {
                console.error(error);
            } else {
                const imgData = canvas.toDataURL("image/png");
                const imgElement = imgRef.current;
                if (imgElement) {
                    imgElement.src = imgData;
                }
            }
        });
    }, [board]);

    const onPrintClick = useCallback(async () => {
        await generateQRCodeImage();
        handlePrint();
    }, [generateQRCodeImage, handlePrint]);

    const PrintableContent = () => (
        <div style={{ display: "none" }}>
            <div ref={containerRef} className="flex justify-center items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-[80px] h-[80px]" ref={imgRef} alt="QR Code" />
            </div>
        </div>
    );

    return { onPrintClick, PrintableContent };
};

