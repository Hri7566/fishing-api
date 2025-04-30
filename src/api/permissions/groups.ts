import { Logger } from "@util/Logger";
import { loadConfig } from "@util/config";

const logger = new Logger("Permission Handler");

export const groups = loadConfig<IGroup[]>("config/permissions.yml", [
    {
        id: "default",
        permissions: [
            "command.general.*",
            "command.fishing.*",
            "command.inventory.*",
            "command.util.*"
        ]
    },
    {
        id: "owner",
        permissions: ["*"]
    }
]);

groups.sort((a, b) => a.id.localeCompare(b.id));

export function findGroup(
    id: string,
    index = Math.floor(groups.length / 2),
    rec = 0
) {
    // let num = groups[index].id.localeCompare(id);
    // if (groups[index].id == id) return groups[index];
    // rec++;

    // if (num > 1) {
    //     findGroup(id, Math.floor(index / 2), rec);
    // } else if (num < 1) {
    //     findGroup(id, Math.floor(index / 2) + index, rec);
    // }

    // logger.debug("Here 2");

    return groups.find(g => g.id === id);
}

export function groupHasPermission(groupID: IGroup["id"], handle: string) {
    const group = findGroup(groupID);
    if (!group) return false;

    for (const permission of group.permissions) {
        if (checkPermission(handle, permission)) return true;
    }
}

export function checkPermission(p1: string, p2: string) {
    const ps1 = p1.split(".");
    const ps2 = p2.split(".");

    for (let i = 0; i < ps1.length; i++) {
        if (ps1[i] === ps2[i]) {
            if (i === ps1.length - 1 || i === ps2.length - 1) {
                return true;
            }

            continue;
        }

        if (ps1[i] === "*") return true;
        if (ps2[i] === "*") return true;

        return false;
    }

    return false;
}
