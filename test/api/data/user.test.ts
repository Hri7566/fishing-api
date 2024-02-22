import type { User } from "@prisma/client";
import { createInventory } from "@server/data/inventory";
import { createUser, getUser, updateUser, deleteUser } from "@server/data/user";
import { test, expect } from "bun:test";

test("User can be created, read, updated, and deleted", async () => {
    const inventory = await createInventory({});

    const data = {
        id: "test",
        name: "test",
        color: "#8d3f50",
        inventoryId: inventory.id
    };

    await createUser(data);
    const user = await getUser(data.id);

    expect(user).toBeDefined();
    expect(user?.id).toBeString();
    expect(user?.name).toBeString();

    await updateUser({
        id: data.id,
        name: "hi"
    });

    const user2 = await getUser(data.id);

    expect(user2).toBeDefined();
    expect(user2?.name).toBeString();

    await deleteUser((user as User).id);
});
