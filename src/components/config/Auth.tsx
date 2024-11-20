"use client";
import { get_user_by_phone, setAuthCookie } from "@/lib/helpers";
import { UserStore } from "@/lib/store";
import { onIdTokenChanged, RecaptchaVerifier } from "@firebase/auth";
import { auth } from "akeyless-client-commons/helpers";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export function Auth() {
    const activeUser = UserStore.activeUser();
    const setActiveUser = UserStore.setActiveUser();
    const router = useRouter();
    useEffect(() => {
        const generateRecaptchaContainer = () => {
            const recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha", {
                size: "invisible",
            });
            window.recaptchaVerifier = recaptchaVerifier;
        };
        generateRecaptchaContainer();
    }, []);
    useEffect(() => {
        (async () => {
            if (!activeUser && window.location.pathname !== "/login") {
                console.log("redirect to login");
                router.push("/login");
            }
            if (activeUser && !activeUser.fullName) {
                const technician = await get_user_by_phone(activeUser.phone!);
                setActiveUser(technician);
            }
        })();
        console.log("activeUser change from Auth", activeUser);
    }, [activeUser]);
    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async (user) => {
            if (user) {
                const token = await user.getIdToken();
                console.log("update cookie token", user);
                setAuthCookie(token);
            } else {
                console.log("delete cookie token");
                deleteCookie("token");
                setActiveUser(null);
            }
        });

        return () => unsubscribe();
    }, []);
    return <div style={{ display: "none" }} id="recaptcha"></div>;
}
