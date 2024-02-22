import prisma from "./prisma";
import { createHash } from "crypto";

export async function createToken() {
    const randomToken = crypto.randomUUID();

    await prisma.authToken.create({
        data: {
            token: randomToken
        }
    });

    return randomToken;
}

export async function deleteToken(token: string) {
    await prisma.authToken.delete({
        where: { token }
    });
}

export async function checkToken(token: string) {
    const existing = await prisma.authToken.findUnique({
        where: { token }
    });

    return !!existing;
}

export async function getAllTokens() {
    return await prisma.authToken.findMany();
}

export function tokenToID(token: string) {
    const hash = createHash("sha-256");
    hash.update("ID");
    hash.update(token);
    return hash.digest("hex").substring(0, 24);
}
