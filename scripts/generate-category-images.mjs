import { spawnSync } from "node:child_process";
import { readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imageDirectory = path.join(projectRoot, "assets", "images", "homepage");
const browserCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];
const sources = ["category-work.webp", "category-plumbing.webp"];
const widths = [240, 360];
const helperPath = path.join(projectRoot, "scripts", ".category-image-resize.html");

let browserPath = "";
for (const candidate of browserCandidates) {
  try {
    await readFile(candidate);
    browserPath = candidate;
    break;
  } catch {
    // Try the next locally installed browser.
  }
}

if (!browserPath) {
  throw new Error("Chrome or Edge is required to regenerate category image variants.");
}

try {
  for (const sourceName of sources) {
    const sourcePath = path.join(imageDirectory, sourceName);
    const sourceUrl = new URL(`../assets/images/homepage/${sourceName}`, import.meta.url).href;
    const sourceStem = path.basename(sourceName, path.extname(sourceName));

    for (const width of widths) {
      const height = width / 2;
      const helperHtml = `<!doctype html><meta charset="utf-8"><img id="source" src="${sourceUrl}"><script>
const image=document.getElementById("source");
image.addEventListener("load",()=>{
  const canvas=document.createElement("canvas");
  canvas.width=${width};
  canvas.height=${height};
  canvas.getContext("2d").drawImage(image,0,0,canvas.width,canvas.height);
  document.body.textContent=canvas.toDataURL("image/webp",0.82);
});
</script>`;

      await writeFile(helperPath, helperHtml, "utf8");
      const result = spawnSync(
        browserPath,
        [
          "--headless=new",
          "--disable-gpu",
          "--no-sandbox",
          "--allow-file-access-from-files",
          "--virtual-time-budget=5000",
          "--dump-dom",
          new URL(`./.category-image-resize.html`, import.meta.url).href,
        ],
        { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
      );

      if (result.status !== 0) {
        throw new Error(result.stderr || `Image conversion failed for ${sourceName}`);
      }

      const match = result.stdout.match(/data:image\/webp;base64,([^<]+)/);
      if (!match) {
        throw new Error(`No WebP output generated for ${sourceName} at ${width}px`);
      }

      const outputPath = path.join(imageDirectory, `${sourceStem}-${width}.webp`);
      await writeFile(outputPath, Buffer.from(match[1], "base64"));
      console.log(`Wrote ${path.relative(projectRoot, outputPath)} (${width}x${height})`);
    }
  }
} finally {
  await rm(helperPath, { force: true });
}
