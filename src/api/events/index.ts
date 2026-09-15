import { EventEmitter, on } from "node:events";

export const eventBus = new EventEmitter();
eventBus.setMaxListeners(0);

export function addEvent<T>(id: string, event: IEvent<T>) {
    eventBus.emit(id, event);
}

export { on };
