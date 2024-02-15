import prisma from "./prisma";

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
