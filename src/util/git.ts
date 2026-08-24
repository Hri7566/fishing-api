import { exec } from "node:child_process";

export function getBranch(): Promise<string> {
    return new Promise((resolve, reject) => {
        exec("git branch --show-current", (err, stdout, _stderr) => {
            if (err) {
                reject(err);
            }

            const branch = stdout.trim();
            resolve(branch);
        });
    });
}
