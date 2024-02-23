import prisma from "./prisma";

export async function createKeyValueStore() {
    return await prisma.keyValueStore.create({
        data: {}
    });
}

export async function getkvInternal() {
    const kv = await prisma.keyValueStore.findUnique({
        where: { id: 0 }
    });

    if (!kv) return await createKeyValueStore();
    return kv;
}

export async function kvSet(key: string, value: any) {
    const kv = await getkvInternal();

    (kv.json as any)[key] = value;

    return await prisma.keyValueStore.update({
        where: {
            id: 0
        },
        data: {
            json: kv.json as any
        }
    });
}

export async function kvGet(key: string) {
    const kv = await getkvInternal();

    return (kv.json as any)[key];
}
