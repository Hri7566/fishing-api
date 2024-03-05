import type { User } from "@prisma/client";
import { getUserGroup } from "@server/data/permissions";

export async function hasPermission(userID: User["id"], handle: string) {
    const dbgroup = await getUserGroup(userID);
    if (!dbgroup) return false;
    dbgroup.groupId;
    return false;
}
