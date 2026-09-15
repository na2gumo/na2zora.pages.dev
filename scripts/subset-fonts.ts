import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build, type GlyphtConfig } from "@glypht/cli";
import fg from "fast-glob";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

// 共通で常に含める基本ASCII文字（記号・英数字など）
const BASE_CHARS =
  " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

// サイト共通要素（ヘッダー・フッター・ナビゲーション・トップページ等）の文字
const COMMON_UI_TEXT =
  "なつぐもna2zoraBlogRSSAllrightsreservedBuiltwithQwikCloudflarePagesAboutMeRecentUpdates技術ブログ記事一覧日々の技術的なメモや雑感を綴る場所です。こんにちは、なつぐもです。シンプルで軽量、表示速度に妥協しないWebサイトが好きです。このサイトはQwikCityとCloudflarePagesをベースに、SCSS、ページ単位のサブセットフォント（BIZUDゴシック/GeistMono）など、こだわりを詰め込んで制作しています。Webフロントエンド、新しい技術スタック、そして#VRChatが好きな開発者です。思考の断片や技術的な学びをここに記録しています。InterestsTechStackTypeScriptすべての記事を見る←→Twitterで共有";

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

async function main() {
  console.log("🔤 Starting per-page font subset generation with glypht...");

  // 全MDXとトップページ等のテキストを収集
  const mdxFiles = await fg(["src/routes/blog/**/index.mdx"], { cwd: rootDir });
  const pages: { name: string; text: string; outDir: string; cssPath: string }[] = [];

  // 1. トップ & 共通UI用
  pages.push({
    name: "common",
    text: BASE_CHARS + COMMON_UI_TEXT,
    outDir: "public/fonts/common",
    cssPath: "public/fonts/common/fonts.css",
  });

  // 2. 各ブログ記事用
  for (const relPath of mdxFiles) {
    const fullPath = path.join(rootDir, relPath);
    const content = fs.readFileSync(fullPath, "utf-8");
    const { data, content: body } = matter(content);
    const match = relPath.match(/src\/routes\/blog\/(.+)\/index\.mdx$/);
    const slug = match ? match[1] : "post";

    const articleText =
      BASE_CHARS +
      COMMON_UI_TEXT +
      (data.title || "") +
      (data.description || "") +
      (data.date || "") +
      body;

    pages.push({
      name: slug,
      text: articleText,
      outDir: `public/fonts/blog/${slug}`,
      cssPath: `public/fonts/blog/${slug}/fonts.css`,
    });
  }

  // 各ページ用のサブセットWOFF2フォントとCSSを生成
  for (const page of pages) {
    console.log(`Generating subset font for [${page.name}]...`);
    const unique = getUniqueChars(page.text);
    const unicodeRange = charsToUnicodeRange(unique);

    const outDirAbs = path.join(rootDir, page.outDir);
    fs.mkdirSync(outDirAbs, { recursive: true });

    // BIZ UDPGothic (日本語 & 全般)
    const bizConfig: GlyphtConfig = {
      input: path.join(rootDir, "fonts/raw/BIZUDPGothic-Regular.ttf"),
      outDir: outDirAbs,
      outCssFile: path.join(rootDir, page.cssPath),
      basePath: `/${page.outDir.replace(/^public\//, "")}/`,
      formats: { woff2: true },
      woff2Compression: 11,
      settings: {
        "BIZ UDPGothic": {
          enableSubsetting: true,
          includeCharacters: {
            includeUnicodeRanges: unicodeRange,
          },
        },
      },
    };

    // Geist Mono (英数・等幅)
    const geistConfig: GlyphtConfig = {
      input: path.join(rootDir, "fonts/raw/GeistMono.ttf"),
      outDir: outDirAbs,
      outCssFile: path.join(rootDir, page.cssPath),
      basePath: `/${page.outDir.replace(/^public\//, "")}/`,
      formats: { woff2: true },
      woff2Compression: 11,
      settings: {
        "Geist Mono": {
          enableSubsetting: true,
          includeCharacters: {
            includeUnicodeRanges: "U+0020-007E",
          },
        },
      },
    };

    try {
      await build(bizConfig, rootDir);
      // CSSを追記モードでGeist Monoを追加
      const existingCss = fs.readFileSync(path.join(rootDir, page.cssPath), "utf-8");
      await build(geistConfig, rootDir);
      const geistCss = fs.readFileSync(path.join(rootDir, page.cssPath), "utf-8");
      
      // 相対URLのパス補正（glyphtが出力するsrc urlを /fonts/... のクリーンなパスに変換）
      let combinedCss = existingCss + "\n" + geistCss;
      combinedCss = combinedCss.replace(
        /src: url\(".*?\/(BIZUDPGothic\.woff2|GeistMono\.woff2)"\)/g,
        `src: url("/${page.outDir.replace(/^public\//, "")}/$1")`
      );
      
      fs.writeFileSync(path.join(rootDir, page.cssPath), combinedCss, "utf-8");
    } catch (e) {
      console.warn(`Font generation warning for ${page.name}:`, e);
    }
  }

  console.log("✨ Font subsetting complete!");
}

main().catch((err) => {
  console.error("Font subsetting failed:", err);
  process.exit(1);
});
