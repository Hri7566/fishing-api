import { loadConfig } from "@util/config";

export const locations = loadConfig<ILocation[]>("config/locations.yml", [
    {
        id: "pond",
        name: "Pond",
        nearby: [],
        hasSand: true,
        objects: []
    },
    {
        id: "lake",
        name: "Lake",
        nearby: [],
        hasSand: false,
        objects: []
    },
    {
        id: "river",
        name: "River",
        nearby: [],
        hasSand: false,
        objects: []
    },
    {
        id: "sea",
        name: "Sea",
        nearby: [],
        hasSand: true,
        objects: []
    }
]);

const sand: IItem = {
    id: "sand",
    name: "Sand"
};

let sandInterval: Timer;

export function startSandInterval() {
    sandInterval = setInterval(() => {
        for (const loc of locations) {
            if (!loc.hasSand) continue;

            let existing = loc.objects.find(obj => obj.id == "sand");
            if (typeof existing !== "undefined") continue;

            loc.objects.push(sand);
        }
    }, 6000);
}

export function stopSandInterface() {
    clearInterval(sandInterval);
}
