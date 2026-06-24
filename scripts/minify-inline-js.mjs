import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const homepagePath = path.join(projectRoot, "index.html");

function minifyInlineScript(script) {
  return script
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("//"))
    .filter((line) => !/^\/\*.*\*\/$/.test(line))
    .join("\n");
}

const homepage = await readFile(homepagePath, "utf8");
const minifiedHomepage = homepage.replace(
  /<script(\s[^>]*)?>([\s\S]*?)<\/script>/g,
  (_, attributes = "", script) =>
    `<script${attributes}>${minifyInlineScript(script)}</script>`,
);

await writeFile(homepagePath, minifiedHomepage, "utf8");
console.log(`Minified inline scripts in ${path.relative(projectRoot, homepagePath)}`);
