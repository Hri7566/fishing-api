import { kvGet, kvSet } from "@server/data/keyValueStore";
import { test, expect } from "bun:test";

test("Key value store saves, loads, and deletes", async () => {
    interface Stuff {
        potatoes: number;
    }

    const stuff: Stuff = {
        potatoes: 30
    };

    const key = "test";

    await kvSet(key, stuff);
    const val = await kvGet<Stuff>(key);
    expect(val.potatoes).toBe(30);

    await kvSet(key, undefined);
    const val2 = await kvGet<Stuff>(key);
    expect(val2).toBeUndefined();
});
