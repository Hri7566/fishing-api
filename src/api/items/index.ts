export function addItem(arr: IObject[], item: IObject) {
    let found = false;
    let i = 0;

    for (i = 0; i < arr.length; i++) {
        if (item.id == arr[i].id) {
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
