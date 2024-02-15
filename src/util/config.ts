import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import YAML from "yaml";
import { parse } from "path/posix";

export function loadConfig<T>(path: string, defaultConfig: T) {
    const parsed = parse(path);
    const dir = parsed.dir;

    if (!existsSync(dir)) {
        mkdirSync(dir);
    }

    if (existsSync(path)) {
        const yaml = readFileSync(path).toString();
        const data = YAML.parse(yaml);

        return data as T;
    } else {
        saveConfig(path, defaultConfig);
        return defaultConfig;
    }
}

export function saveConfig<T>(path: string, config: T) {
    writeFileSync(path, YAML.stringify(config));
}
