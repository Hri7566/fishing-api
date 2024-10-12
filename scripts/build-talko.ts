import esbuild from "esbuild";
import fs from "fs";

try {
    console.log("Making build directory...");
    fs.mkdirSync("./build");
} catch (err) {
    console.log("Directory already exists");
}

console.log("Creating script bundle...");
const result = await esbuild.build({
    entryPoints: ["src/talkomatic/index.ts"],
    bundle: true,
    target: "node22.9",
    platform: "node",
    format: "cjs",
    tsconfig: "./tsconfig.talko.json",
    outdir: "./build/"
});

// console.log(result);
console.log("Done!");
