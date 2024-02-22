import prisma from "./prisma";

export async function createInventory(inventory: Partial<IInventory>) {
    return await prisma.inventory.create({
        data: inventory
    });
}

export async function getInventory(id: IInventory["id"]) {
    return await prisma.inventory.findUnique({
        where: { id }
    });
}

export async function updateInventory(inventory: Partial<IInventory>) {
    return await prisma.inventory.update({
        where: { id: inventory.id },
        data: inventory
    });
}

export async function deleteInventory(id: IInventory["id"]) {
    return await prisma.inventory.delete({
        where: { id }
    });
}
