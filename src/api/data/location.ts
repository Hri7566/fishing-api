import prisma from "./prisma";

export async function createObjectStorage(id: string, objects: TObjectArray) {
    return prisma.locationObjectStorage.create({
        data: { id, objects }
    });
}

export async function getObjectStorage(id: string) {
    return prisma.locationObjectStorage.findUnique({
        where: { id }
    });
}

export async function updateObjectStorage(id: string, objects: TObjectArray) {
    return prisma.locationObjectStorage.update({
        where: { id },
        data: { objects }
    });
}

export async function deleteObjectStorage(id: string) {
    return prisma.locationObjectStorage.delete({
        where: { id }
    });
}
