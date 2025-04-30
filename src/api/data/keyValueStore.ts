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

export async function kvSet(key: string, value: unknown) {
    const kv = await getkvInternal();
    if (!kv.json) kv.json = {};
    (kv.json as Record<string, unknown>)[key] = value;

    return await prisma.keyValueStore.update({
        where: {
            id: 0
        },
        data: {
            json: kv.json
        }
    });
}

export async function kvGet<T>(key: string) {
    const kv = await getkvInternal();

    return (kv.json as Record<string, T>)[key];
}
