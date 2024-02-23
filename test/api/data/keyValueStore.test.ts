import { kvGet, kvSet } from "@server/data/keyValueStore";
import { test, expect } from "bun:test";

test("Key value store saves, loads, and deletes", async () => {
    await kvSet("test", 1);
    const val = await kvGet("test");
    expect(val).toBe(1);

    await kvSet("test", undefined);
    const val2 = await kvGet("test");
    expect(val2).toBeUndefined();
});
