type TickEvent = () => Promise<void> | void;

const ticks: TickEvent[] = [];

(globalThis as unknown as Record<string, unknown>).ticker = setInterval(() => {
    for (const tick of ticks) tick();
}, 1000 / 20);

export function addTickEvent(event: TickEvent) {
    ticks.push(event);
}

export function removeTickEvent(event: TickEvent) {
    const index = ticks.indexOf(event);

    if (index >= 0) {
        ticks.splice(index, 1);
    }
}
