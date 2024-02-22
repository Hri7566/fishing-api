import {
    createObjectStorage,
    getObjectStorage,
    updateObjectStorage
} from "@server/data/location";
import { Logger } from "@util/Logger";
import { loadConfig } from "@util/config";
import { addTickEvent, removeTickEvent } from "@util/tick";

export const locations = loadConfig<ILocation[]>("config/locations.yml", [
    {
        id: "pond",
        name: "Pond",
        nearby: ["lake", "river", "sea"],
        hasSand: true,
        objects: []
    },
    {
        id: "lake",
        name: "Lake",
        nearby: ["pond", "river", "sea"],
        hasSand: false,
        objects: []
    },
    {
        id: "river",
        name: "River",
        nearby: ["pond", "lake", "sea"],
        hasSand: false,
        objects: []
    },
    {
        id: "sea",
        name: "Sea",
        nearby: ["pond", "lake", "river"],
        hasSand: true,
        objects: []
    }
]);

const sand: IItem = {
    id: "sand",
    objtype: "item",
    name: "Sand"
};

let objectInterval: Timer;
const logger = new Logger("Places");

export function populateSand() {
    for (const loc of locations) {
        if (!loc.hasSand) continue;

        let existing = loc.objects.find(obj => obj.id == "sand");
        if (typeof existing !== "undefined") continue;

        loc.objects.push(sand);
    }
}

export async function loadObjects() {
    for (const loc of locations) {
        let storage = await getObjectStorage(loc.id);
        if (!storage) continue;
        if (!storage.objects) continue;

        if (storage.objects == null) continue;

        if (typeof storage.objects == "string") {
            storage.objects = JSON.parse(storage.objects);
        }

        loc.objects = storage.objects as unknown as IObject[];
    }
}

export async function saveObjects() {
    for (const loc of locations) {
        let storage = await getObjectStorage(loc.id);

        if (!storage) {
            storage = await createObjectStorage(loc.id, loc.objects);
        } else {
            await updateObjectStorage(loc.id, loc.objects);
        }
    }
}

export function startObjectTimers() {
    loadObjects();
    addTickEvent(populateSand);
    addTickEvent(saveObjects);
}

export function stopObjectTimers() {
    saveObjects();
    removeTickEvent(populateSand);
    removeTickEvent(saveObjects);
}
