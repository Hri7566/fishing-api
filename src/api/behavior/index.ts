import { logger } from "@server/commands/handler";

export const behaviorMap = new Map<string, TBehavior<unknown, unknown>>();

class BehaviorError extends Error {}

function splitBehaviorID(id: TBehaviorID) {
    const args = id.split(":");

    if (typeof args[0] === "undefined" || typeof args[1] === "undefined")
        throw new BehaviorError(
            "Incomplete behavior ID (should have exactly two segments)"
        );

    if (typeof args[0] !== "string" || typeof args[1] !== "string")
        throw new BehaviorError(
            `Invalid behavior ID (expected: string:string, got: ${typeof args[0]}:${typeof args[1]})`
        );

    if (typeof args[3] !== "undefined")
        throw new BehaviorError("Invalid behavior ID: Too many segments");

    return args;
}

export function registerBehavior<
    K extends keyof IBehaviorContextStateDefinitions,
    Context = IBehaviorContextStateDefinitions[K]["context"],
    State = IBehaviorContextStateDefinitions[K]["state"]
>(id: TBehaviorID, behavior: TBehaviorCallback<Context, State>) {
    try {
        const args = splitBehaviorID(id);
        const namespace = args[0];
        const action = args[1];

        if (!behaviorMap.has(namespace)) behaviorMap.set(namespace, {});
        const set = behaviorMap.get(namespace);
        if (!set)
            throw new BehaviorError("Unable to resolve namespace to value");
        set[action] = behavior as TBehaviorCallback<unknown, unknown>;
    } catch (err) {
        throw new BehaviorError(`Unable to register behavior: ${err}`);
    }
}

export async function executeBehavior<
    K extends keyof IBehaviorContextStateDefinitions,
    Context = IBehaviorContextStateDefinitions[K]["context"],
    State = IBehaviorContextStateDefinitions[K]["state"]
>(id: TBehaviorID, context: Context): Promise<TBehaviorResponse<State>> {
    const args = splitBehaviorID(id);
    const namespace = args[0];
    const action = args[1];

    const set = behaviorMap.get(namespace);
    if (!set) throw new BehaviorError("Unable to resolve namespace to value");

    const callback = set[action];

    if (!callback)
        return {
            success: false,
            err: `No callback defined for ${id}`
        };

    return (await callback(context)) as TBehaviorResponse<State>;
}
