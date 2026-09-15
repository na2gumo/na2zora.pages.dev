/**
 * Glypht build configuration example
 * 
 * To subset self-hosted fonts with glypht:
 * 1. Place your raw .ttf/.otf fonts in `fonts/raw/`
 * 2. Run `pnpm font:subset`
 * 3. Include `public/fonts/fonts.css` in your app
 */
import type { GlyphtConfig } from "@glypht/cli";

const config: GlyphtConfig = {
  input: "fonts/raw/**/*.{ttf,otf}",
  outDir: "public/fonts",
  outCssFile: "fonts.css",
  basePath: "/fonts/",
  formats: {
    woff2: true,
  },
  woff2Compression: 11,
  settings: {
    "BIZ UDGothic": {
      enableSubsetting: true,
      includeCharacters: {
        includeNamedSubsets: ["latin", "japanese"],
      },
    },
    "Geist Mono": {
      enableSubsetting: true,
      includeCharacters: {
        includeNamedSubsets: ["latin"],
      },
    },
  },
};

export default config;
