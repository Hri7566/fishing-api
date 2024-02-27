export const itemBehaviorMap: TItemBehaviorMap = {};

export function addItemBehavior(itemID: string, bhv: TItemBehavior) {
    itemBehaviorMap[itemID] = bhv;
}
