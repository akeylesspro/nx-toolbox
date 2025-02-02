"use client";
import { get_user_by_phone, setAuthCookie } from "@/app/login/helpers";
import { UserStore } from "@/lib/store";
import { Auth as AuthType, onIdTokenChanged, RecaptchaVerifier } from "@firebase/auth";
import { auth } from "akeyless-client-commons/helpers";
import { initializeUserPermissions } from "akeyless-client-commons/helpers";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";
export function Auth() {
    const activeUser = UserStore.activeUser();
    const setActiveUser = UserStore.setActiveUser();
    const setUserPermissions = UserStore.setUserPermissions();
    const router = useRouter();
    const snapshotsFirstTime = useRef<string[]>([]);
    const unsubscribe = useRef<(() => void) | undefined>(undefined);
    // update cookie token on login
    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async (user) => {
            if (user) {
                const token = await user.getIdToken();
                setAuthCookie(token);
            } else {
                setActiveUser(null);
            }
        });

        return () => unsubscribe();
    }, []);
    // generate recaptcha container
    useEffect(() => {
        const generateRecaptchaContainer = () => {
            const recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha", {
                size: "invisible",
            });
            window.recaptchaVerifier = recaptchaVerifier;
        };
        generateRecaptchaContainer();
    }, []);
    // check if user is allowed to access and redirect to login if not
    useEffect(() => {
        (async () => {
            try {
                if (!activeUser && window.location.pathname !== "/login") {
                    throw new Error("activeUser is null");
                }
                if (activeUser && !activeUser.clients) {
                    // const user = await get_user_by_phone("+972547380791");
                    const user = await get_user_by_phone(activeUser!.phone_number!);
                    if (!user) {
                        throw new Error("user not found");
                    }
                    const snapshotResult = await initializeUserPermissions({
                        phoneNumber: user.phone_number!,
                        firstTimeArray: snapshotsFirstTime.current,
                        getUpdatePermissions: (permissions) => {
                            setUserPermissions(permissions);
                        },
                    });

                    if (!snapshotResult.permissions.toolbox) {
                        throw new Error("user not allowed");
                    }
                    unsubscribe.current = snapshotResult.unsubscribe;
                    setActiveUser(user);
                }
            } catch (error: any) {
                console.log("exception in Auth, redirect to login ...", error.message);
                deleteCookie("token");
                auth.signOut();
                router.push("/login");
            }
        })();
    }, [activeUser]);
    // clean up
    useEffect(() => {
        return () => {
            if (unsubscribe.current) {
                unsubscribe.current();
            }
        };
    }, []);

    return <div style={{ display: "none" }} id="recaptcha"></div>;
}
