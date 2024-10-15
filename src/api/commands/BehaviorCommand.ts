import type { User } from "@prisma/client";
import Command from "./Command";
import { behaviorMap, executeBehavior } from "@server/behavior";
import { logger } from "./handler";

export class BehaviorCommand extends Command {
    constructor(
        public id: string,
        public aliases: string[],
        public description: string,
        public usage: string,
        public permissionNode: string,
        callback: TCommandCallbackWithSelf<User, BehaviorCommand>,
        public visible: boolean = true
    ) {
        super(
            id,
            aliases,
            description,
            usage,
            permissionNode,
            props => callback(props, this),
            visible
        );
    }

    public async behave<
        K extends keyof IBehaviorContextStateDefinitions,
        C = IBehaviorContextStateDefinitions[K]["context"],
        S = IBehaviorContextStateDefinitions[K]["state"]
    >(context: C, objectId: string, defaultCallback: TBehaviorCallback<C, S>) {
        const key = `${objectId}:${this.id}` as TBehaviorID;
        let hasBehavior = false;
        const container = behaviorMap.get(objectId);

        if (container) hasBehavior = typeof container[this.id] === "function";

        if (hasBehavior) {
            return await executeBehavior(key, context);
        } else {
            return (await defaultCallback(context)) as TBehaviorResponse<S>;
        }
    }
}

export default BehaviorCommand;
