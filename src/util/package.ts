import * as pkg from "../../package.json";

export function getVersion() {
    return pkg.version;
}

export function getName() {
    return pkg.name;
}
