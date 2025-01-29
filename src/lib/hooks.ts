import { useRouter } from "next/navigation";
import { UserStore } from "./store";
import { useLayoutEffect } from "react";

export const useCheckPermissions = (permissions: { entity: string; permission?: string }[]) => {
    const userPermissions = UserStore.userPermissions();
    const router = useRouter();
    useLayoutEffect(() => {
        if (!permissions.some(({ entity, permission }) => userPermissions[entity] && (permission ? userPermissions[entity][permission] : true))) {
            router.push("/error");
        }
    }, [userPermissions]);
    return null;
};
