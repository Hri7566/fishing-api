import {
    createInventory,
    deleteInventory,
    getInventory
} from "@server/data/inventory";
import { test, expect } from "bun:test";

test("Inventory can be created, read, updated and deleted", async () => {
    const inventory = await createInventory({});
    expect(inventory.id).toBeNumber();

    await deleteInventory(inventory.id);

    const badInventory = await getInventory(inventory.id);
    expect(badInventory).toBeNull();
});
