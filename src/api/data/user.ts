import type { User } from "@prisma/client";
import prisma from "./prisma";

export async function createUser(user: User) {
    return await prisma.user.create({
        data: user
    });
}

export async function getUser(id: string) {
    const user = await prisma.user.findUnique({
        where: { id }
    });

    return user;
}

export async function updateUser(user: Partial<User> & { id: User["id"] }) {
    return await prisma.user.update({
        where: {
            id: user.id
        },
        data: user
    });
}

export async function deleteUser(id: string) {
    return await prisma.user.delete({
        where: { id }
    });
}
