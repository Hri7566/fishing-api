import { getAllTokens } from "@server/data/token";
import { ReadlineCommand } from "../ReadlineCommand";
import { setUserGroup } from "@server/data/permissions";

export const setgroup = new ReadlineCommand(
    "setgroup",
    ["setgroup"],
    "Set a user's permission group",
    "setgroup <user ID> <group ID>",
    async line => {
        const args = line.split(" ");
        const userID = args[1];
        const groupID = args[2];

        if (!userID) return "Please provide a user ID.";
        if (!groupID) return "Please provide a group ID.";

        await setUserGroup(userID, groupID);
        return `User's group is now ${groupID}.`;
    }
);
