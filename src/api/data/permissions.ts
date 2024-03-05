import type { User } from "@prisma/client";
import prisma from "./prisma";

export async function setUserGroup(userID: User["id"], groupID: string) {
    const existing = await getUserGroup(userID);
    if (!existing) createUserGroup(userID, "default");
    return await prisma.userPermission.update({
        where: {
            userId: userID,
            groupId: groupID
        },
        data: {
            groupId: groupID,
            userId: userID
        }
    });
}

export async function getUserGroup(userID: User["id"]) {
    const existing = await prisma.userPermission.findUnique({
        where: {
            userId: userID
        }
    });

    if (existing) return existing;

    await createUserGroup(userID, "default");

    return await prisma.userPermission.findUnique({
        where: {
            userId: userID
        }
    });
}

export async function createUserGroup(userID: User["id"], groupID: string) {
    return await prisma.userPermission.create({
        data: {
            userId: userID,
            groupId: groupID
        }
    });
}
