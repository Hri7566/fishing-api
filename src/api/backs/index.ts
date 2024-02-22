export const backs: Record<string, IBack<unknown>[]> = {};

export function flushBacks<T>(id: string) {
    backs[id] = [];
}

export function addBack<T>(id: string, back: IBack<T>) {
    if (!backs[id]) backs[id] = [];
    backs[id].push(back);
}

export function hasBack<T>(id: string, back: IBack<T>) {
    if (!backs[id]) return false;
    if (backs[id].includes(back)) return true;
}

export function getBacks<T>(id: string) {
    if (!backs[id]) return [];
    return backs[id] as T;
}
