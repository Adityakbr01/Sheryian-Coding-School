import { build } from "esbuild";
import fs from "fs";
import path from "path";

// Ensure dist exists
if (!fs.existsSync("dist")) {
    fs.mkdirSync("dist");
}

// 🔥 1️⃣ Build popup
await build({
    entryPoints: ["src/popup/popup.ts"],
    bundle: true,
    outfile: "dist/popup.js",
    format: "iife",
    target: "chrome100",
    minify: true,
});

// 🔥 2️⃣ Build service worker
await build({
    entryPoints: ["src/background/service-worker.ts"],
    bundle: true,
    outfile: "dist/service-worker.js",
    format: "iife",
    target: "chrome100",
    minify: true,
});

// 🔥 3️⃣ Build content script (IMPORTANT - missing before)
await build({
    entryPoints: ["src/content/content.ts"],
    bundle: true,
    outfile: "dist/content.js",
    format: "iife",
    target: "chrome100",
    minify: true,
});

// 🔥 4️⃣ Process popup HTML
let html = fs.readFileSync("src/popup/popup.html", "utf-8");

// Replace TS → JS
html = html.replace(/popup\.ts/g, "popup.js");

// Fix script path
html = html.replace(/src=".*popup\.js"/g, 'src="popup.js"');

// Optional: remove module type if exists
html = html.replace(/type="module"/g, "");

// Save to dist
fs.writeFileSync("dist/popup.html", html);

// 🔥 5️⃣ Copy assets (icons etc.)
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);
    for (const file of files) {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);

        if (fs.lstatSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Copy assets → dist/assets
if (fs.existsSync("assets")) {
    copyDir("assets", "dist/assets");
}

console.log("✅ Build complete (Production Ready)");