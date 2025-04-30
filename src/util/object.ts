/**
 * Mix two objects together
 * @param object Object to mix into
 * @param record Data to be mixed in
 * @param deep Whether to deep-copy nested objects (on by default)
 * @returns Whether the object has new keys
 */
export function mix(
    object: Record<string, unknown>,
    record: Record<string, unknown>,
    deep = true
) {
    let changed = false;

    for (const key of Object.keys(record)) {
        if (typeof object[key] === "undefined") {
            object[key] = record[key];
            changed = true;
        }

        if (
            deep === true &&
            typeof object[key] === "object" &&
            !Array.isArray(object[key])
        ) {
            mix(
                object[key] as Record<string, unknown>,
                record[key] as Record<string, unknown>
            );
        }
    }

    return changed;
}

/**
 * Deep clone an object
 * @param o Object to copy
 * @returns Duplicate object
 */
export function copy<T>(o: T) {
    const obj: Record<string, unknown> = {};

    for (const key of Object.keys(o as Record<string, unknown>)) {
        obj[key] = (o as Record<string, unknown>)[key];
    }

    return obj as T;
}
