export function getHHMMSS() {
    const now = Date.now();

    const s = now / 1000;
    const m = s / 60;
    const h = m / 60;

    const hh = Math.floor(h % 12)
        .toString()
        .padStart(2, "0");
    const mm = Math.floor(m % 60)
        .toString()
        .padStart(2, "0");
    const ss = Math.floor(s % 60)
        .toString()
        .padStart(2, "0");
    const ms = Math.floor(now % 1000)
        .toString()
        .padStart(3, "0");

    return `${hh}:${mm}:${ss}.${ms}`;
}
