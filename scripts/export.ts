import prisma from "@server/data/prisma";

const data = {
    users: await prisma.user.findMany(),
    inventories: await prisma.inventory.findMany(),
    authTokens: await prisma.authToken.findMany(),
    locationObjectStorages: await prisma.locationObjectStorage.findMany(),
    keyValueStores: await prisma.keyValueStore.findMany(),
    userPermissions: await prisma.userPermission.findMany()
};

await Bun.write("export.json", JSON.stringify(data, undefined, 4));
