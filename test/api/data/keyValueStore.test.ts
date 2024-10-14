import { kvGet, kvSet } from "@server/data/keyValueStore";
import { test, expect } from "bun:test";

test("Key value store saves, loads, and deletes", async () => {
    const stuff = {
        potatoes: 30
    };

    await kvSet("test", stuff);
    const val = await kvGet("test");
    expect(val.potatoes).toBe(30);

    await kvSet("test", undefined);
    const val2 = await kvGet("test");
    expect(val2).toBeUndefined();
});
