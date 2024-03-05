import { addItemBehavior } from ".";
import { fish } from "./items/fish";
import { kekklefruit } from "./items/kekklefruit";

export function loadDefaultBehaviors() {
    const list: IBehaviorDefinition[] = [fish, kekklefruit];

    for (const item of list) {
        for (const key of Object.keys(item.bhv)) {
            addItemBehavior(item.id, key, item.bhv[key]);
        }
    }
}
