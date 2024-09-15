export function getTime(t = Date.now(), twelveHour = true) {
    const now = t;

    const s = now / 1000;
    const m = s / 60;
    const h = m / 60;

    const hours = Math.floor(h % (twelveHour ? 12 : 24))
        .toString()
        .padStart(2, "0");
    const minutes = Math.floor(m % 60)
        .toString()
        .padStart(2, "0");
    const seconds = Math.floor(s % 60)
        .toString()
        .padStart(2, "0");
    const milliseconds = Math.floor(now % 1000)
        .toString()
        .padStart(3, "0");

    return {
        hours,
        minutes,
        seconds,
        milliseconds
    };
}

export function getHHMMSS(t = Date.now(), twelveHour = true) {
    const { hours, minutes, seconds, milliseconds } = getTime(t, twelveHour);
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}
