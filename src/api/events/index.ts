export const events: Record<string, IEvent<unknown>[]> = {};

export function flushEvents<T>(id: string) {
    events[id] = [];
}

export function addEvent<T>(id: string, event: IEvent<T>) {
    if (!events[id]) events[id] = [];
    events[id].push(event);
}

export function hasEvent<T>(id: string, event: IEvent<T>) {
    if (!events[id]) return false;
    if (events[id].includes(event)) return true;
}

export function getEvents<T>(id: string) {
    if (!events[id]) return [];
    return events[id] as T;
}
