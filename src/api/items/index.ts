export function addItem(arr: IObject[], item: IObject) {
    let found = false;
    let i = 0;

    for (i = 0; i < arr.length; i++) {
        if (item.id === arr[i].id) {
            found = true;
            break;
        }
    }

    if (!found) {
        arr.push(item);
        return;
    }

    let inc = 1;
    if (item.count) inc = item.count;

    if (!arr[i].count) {
        arr[i].count = inc + 1;
    } else {
        (arr[i].count as number) += inc;
    }
}

export function removeItem(arr: IObject[], item: IObject, count = 1) {
    let found = false;
    let i = 0;

    for (i = 0; i < arr.length; i++) {
        if (item.id === arr[i].id) {
            found = true;
            break;
        }
    }

    const foundItem = arr[i];
    if (!found || !foundItem) return false;

    if (typeof foundItem.count === "number" && foundItem.count > 1) {
        foundItem.count -= count;
    } else {
        arr.splice(i, 1);
    }

    return true;
}

export function findItemByNameFuzzy(arr: IObject[], name: string) {
    let foundObject: IObject | undefined;
    let i = 0;

    for (const item of arr as unknown as IItem[]) {
        if (!item.name.toLowerCase().includes(name.toLowerCase())) {
            i++;
            continue;
        }

        foundObject = item;
        break;
    }

    return foundObject;
}
