export const itemBehaviorMap: TBehaviorMap = {};

export function addItemBehavior(
    itemID: string,
    bhvID: string,
    bhv: TBehaviorCallback
) {
    if (!itemBehaviorMap[itemID]) itemBehaviorMap[itemID] = {};
    itemBehaviorMap[itemID][bhvID] = bhv;
}

export async function runBehavior(
    itemID: string,
    bhvID: string,
    obj: IObject,
    props: IContextProps
): Promise<IBehaviorResponse> {
    const callback = itemBehaviorMap[itemID][bhvID];
    if (!callback)
        return {
            success: false,
            err: "No callback",
            shouldRemove: false
        };
    return await callback(obj, props);
}
