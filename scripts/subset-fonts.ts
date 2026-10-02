import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build, type GlyphtConfig } from "@glypht/cli";
import fg from "fast-glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

// 共通で常に含める基本ASCII文字（記号・英数字など）
const BASE_CHARS =
  " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

function getUniqueChars(text: string): string {
  const set = new Set(Array.from(text));
  return Array.from(set).join("");
}

function charsToUnicodeRange(chars: string): string {
  const codePoints = Array.from(chars)
    .map((c) => c.codePointAt(0)!)
    .filter((cp) => cp !== undefined)
    .sort((a, b) => a - b);

  const unique = Array.from(new Set(codePoints));
  const ranges: string[] = [];

  let start = unique[0];
  let prev = start;

  for (let i = 1; i < unique.length; i++) {
    const curr = unique[i];
    if (curr === prev + 1) {
      prev = curr;
    } else {
      if (start === prev) {
        ranges.push(`U+${start.toString(16).toUpperCase()}`);
      } else {
        ranges.push(
          `U+${start.toString(16).toUpperCase()}-${prev.toString(16).toUpperCase()}`
        );
      }
      start = curr;
      prev = curr;
    }
  }

  if (start !== undefined) {
    if (start === prev) {
      ranges.push(`U+${start.toString(16).toUpperCase()}`);
    } else {
      ranges.push(
        `U+${start.toString(16).toUpperCase()}-${prev.toString(16).toUpperCase()}`
      );
    }
  }

  return ranges.join(", ");
}

async function collectAllSourceText(): Promise<string> {
  const sourceFiles = await fg(["src/**/*.{tsx,ts,jsx,js,scss,css,html}"], {
    cwd: rootDir,
    ignore: ["node_modules/**", "dist/**"],
  });

  let collected = "";
  for (const relPath of sourceFiles) {
    const fullPath = path.join(rootDir, relPath);
    try {
      const content = fs.readFileSync(fullPath, "utf-8");
      collected += content;
    } catch (e) {
      console.warn(`Failed to read file for font subset: ${relPath}`, e);
    }
  }

  return collected;
}

async function main() {
  console.log("🔤 Scanning source files and generating font subset with glypht...");

  const sourceText = await collectAllSourceText();
  const allChars = BASE_CHARS + sourceText;
  const uniqueChars = getUniqueChars(allChars);
  const unicodeRange = charsToUnicodeRange(uniqueChars);

  const outDir = "public/fonts/common";
  const cssPath = "public/fonts/common/fonts.css";
  const outDirAbs = path.join(rootDir, outDir);
  fs.mkdirSync(outDirAbs, { recursive: true });

  console.log(`Included unique characters: ${uniqueChars.length}`);

  // 和文フォントはソース中の文字だけ、Anton と Geist Mono は ASCII だけに絞る
  const subsetBySource = {
    enableSubsetting: true,
    includeCharacters: { includeUnicodeRanges: unicodeRange },
  };

  const config: GlyphtConfig = {
    input: [
      "fonts/raw/BIZUDPGothic-Regular.ttf",
      "fonts/raw/DelaGothicOne-Regular.ttf",
      "fonts/raw/Anton-Regular.ttf",
      "fonts/raw/GeistMono.ttf",
    ],
    outDir,
    outCssFile: cssPath,
    basePath: `/${outDir.replace(/^public\//, "")}/`,
    formats: { woff2: true },
    woff2Compression: 11,
    settings: {
      // BIZ UDPGothic: 本文
      "BIZ UDPGothic": subsetBySource,
      // Dela Gothic One: 和文の見出し
      "Dela Gothic One": subsetBySource,
      // Anton: 英字の巨大な見出し
      Anton: {
        enableSubsetting: true,
        includeCharacters: { includeUnicodeRanges: "U+0020-007E" },
      },
      // Geist Mono: 英数・等幅
      "Geist Mono": {
        enableSubsetting: true,
        includeCharacters: { includeUnicodeRanges: "U+0020-007E" },
      },
    },
  };

  try {
    await build(config, rootDir);
    // glypht は basePath にファイルパスをそのまま連結するので、公開 URL に直す
    const cssAbs = path.join(rootDir, cssPath);
    const css = fs
      .readFileSync(cssAbs, "utf-8")
      .replace(/url\(".*?\/([^/"]+\.woff2)"\)/g, `url("/${outDir.replace(/^public\//, "")}/$1")`);
    fs.writeFileSync(cssAbs, css, "utf-8");
  } catch (e) {
    console.warn("Font generation warning:", e);
  }

  console.log("✨ Font subsetting complete!");
}

main().catch((err) => {
  console.error("Font subsetting failed:", err);
  process.exit(1);
});
