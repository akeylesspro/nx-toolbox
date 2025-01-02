import { add_document } from "akeyless-server-commons/helpers";
import { logger } from "akeyless-server-commons/managers";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { parseFormData } from "../../helpers";
export const config = {
    runtime: "nodejs",
};

export async function POST(request: Request) {
    try {
        const data = parseFormData(await request.formData());
        await add_document("nx-sms-in", {
            external_id: data.SmsSid,
            content: data.Body,
            sender: data.From,
            service: "twilio",
            timestamp: Timestamp.now(),
        });
        logger.log("twilio incoming message successfully saved in db", { ...data, service: "twilio" });
        return NextResponse.json({ success: true, msg: "ok" });
    } catch (error) {
        logger.error("twilio exception in api/sms/twilio/in route", error);
        return NextResponse.json({ success: false, error: "failed to process request" }, { status: 400 });
    }
}
