import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceCssPath = path.join(projectRoot, "assets", "css", "site-shell.css");
const minifiedCssPath = path.join(projectRoot, "assets", "css", "site-shell.min.css");
const criticalCssPath = path.join(projectRoot, "assets", "css", "home-critical.css");
const homepagePath = path.join(projectRoot, "index.html");

function minifyCss(css) {
  let output = "";
  let pendingSpace = false;
  let quote = "";

  for (let index = 0; index < css.length; index += 1) {
    const character = css[index];
    const nextCharacter = css[index + 1];

    if (quote) {
      output += character;
      if (character === "\\") {
        output += nextCharacter ?? "";
        index += 1;
      } else if (character === quote) {
        quote = "";
      }
      continue;
    }

    if (character === '"' || character === "'") {
      if (pendingSpace && output && !/[{(:;,>]/.test(output.at(-1))) {
        output += " ";
      }
      pendingSpace = false;
      quote = character;
      output += character;
      continue;
    }

    if (character === "/" && nextCharacter === "*") {
      const commentEnd = css.indexOf("*/", index + 2);
      if (commentEnd === -1) {
        throw new Error("Unclosed CSS comment");
      }
      pendingSpace = true;
      index = commentEnd + 1;
      continue;
    }

    if (/\s/.test(character)) {
      pendingSpace = true;
      continue;
    }

    if (pendingSpace) {
      const previousCharacter = output.at(-1) ?? "";
      if (
        output &&
        !/[{(:;,>]/.test(previousCharacter) &&
        !/[}):;,>]/.test(character)
      ) {
        output += " ";
      }
      pendingSpace = false;
    }

    if (/[{}:;,>]/.test(character) && output.endsWith(" ")) {
      output = output.slice(0, -1);
    }
    output += character;
  }

  return output.trim();
}

const sourceCss = await readFile(sourceCssPath, "utf8");
await writeFile(minifiedCssPath, `${minifyCss(sourceCss)}\n`, "utf8");

const criticalCss = minifyCss(await readFile(criticalCssPath, "utf8"));
let homepage = await readFile(homepagePath, "utf8");

if (/<style data-critical>[\s\S]*?<\/style>/.test(homepage)) {
  homepage = homepage.replace(
    /<style data-critical>[\s\S]*?<\/style>/,
    `<style data-critical>${criticalCss}</style>`,
  );
} else {
  const noscriptEnd = homepage.indexOf("</noscript>");
  const headEnd = homepage.indexOf("</head>");
  const stylePattern = /<style(?:\s[^>]*)?>[\s\S]*?<\/style>/g;
  const removableStyles = [...homepage.matchAll(stylePattern)].filter(
    (match) => match.index > noscriptEnd && match.index < headEnd,
  );

  if (!removableStyles.length) {
    throw new Error("Unable to locate homepage critical CSS");
  }

  const firstStyle = removableStyles[0];
  const lastStyle = removableStyles.at(-1);
  homepage =
    homepage.slice(0, firstStyle.index) +
    `<style data-critical>${criticalCss}</style>` +
    homepage.slice(lastStyle.index + lastStyle[0].length);
}

const minifiedHomepage = homepage.replace(
  /<style([^>]*)>([\s\S]*?)<\/style>/g,
  (_, attributes, css) => `<style${attributes}>${minifyCss(css)}</style>`,
);
await writeFile(homepagePath, minifiedHomepage, "utf8");

console.log(`Minified ${path.relative(projectRoot, sourceCssPath)}`);
console.log(`Wrote ${path.relative(projectRoot, minifiedCssPath)}`);
console.log(`Inlined ${path.relative(projectRoot, criticalCssPath)}`);
console.log(`Minified inline styles in ${path.relative(projectRoot, homepagePath)}`);
