import { addItem, findItemByNameFuzzy, removeItem } from "@server/items";
import { test, expect } from "bun:test";

test("Add item works", () => {
    const items: IItem[] = [];
    const item: IItem = {
        id: "hamburger",
        name: "Hamburger",
        objtype: "item",
        count: 2,
        emoji: "🍔"
    };

    addItem(items, item);

    expect(items).toBeArrayOfSize(1);
    expect(items[0]).toBeObject();
    expect(items[0]).toEqual(item);

    const item2: IItem = {
        id: "cheeseburger",
        name: "Cheeseburger",
        objtype: "item",
        count: 1,
        emoji: "🧀"
    };

    addItem(items, item2);

    expect(items).toBeArrayOfSize(2);
    expect(items[1]).toBeObject();
    expect(items[1]).toEqual(item2);

    const item3: IItem = {
        id: "hamburger",
        name: "Hamburger",
        objtype: "item",
        count: 1,
        emoji: "🍔"
    };

    addItem(items, item3);

    expect(items).toBeArrayOfSize(2);
    expect(items[0]).toBeObject();
    expect(items[0].count).toBe(3);
});

test("Remove item works", () => {
    const items: IItem[] = [
        {
            id: "hamburger",
            name: "Hamburger",
            objtype: "item",
            count: 3,
            emoji: "🍔"
        },
        {
            id: "cheeseburger",
            name: "Cheeseburger",
            objtype: "item",
            count: 1,
            emoji: "🧀"
        }
    ];

    removeItem(items, items[1], 1);

    expect(items).toBeArrayOfSize(1);
    expect(items[0].id).toBe("hamburger");
});

test("Fuzzy find item works", () => {
    const items: IItem[] = [
        {
            id: "hamburger",
            name: "Hamburger",
            objtype: "item",
            count: 3,
            emoji: "🍔"
        },
        {
            id: "cheeseburger",
            name: "Cheeseburger",
            objtype: "item",
            count: 1,
            emoji: "🧀"
        }
    ];

    const item = findItemByNameFuzzy(items, "cheesebur");

    expect(item).toBeObject();
    expect(item?.id).toBe("cheeseburger");
    expect(item?.count).toBe(1);
});
