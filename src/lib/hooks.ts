import { useRouter } from "next/navigation";
import { UserStore } from "./store";
import { useLayoutEffect } from "react";

export const useCheckPermissions = (permissions: { entity: string; permission: string }[]) => {
    const userPermissions = UserStore.userPermissions();
    const router = useRouter();
    useLayoutEffect(() => {
        if (!permissions.some(({ entity, permission }) => (userPermissions[entity] && userPermissions[entity][permission]))) {
            router.push("/error");
        }
    }, [userPermissions]);
    return null;
};
