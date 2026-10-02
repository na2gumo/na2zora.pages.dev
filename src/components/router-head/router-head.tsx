import { component$ } from "@builder.io/qwik";
import { useDocumentHead, useLocation } from "@builder.io/qwik-city";

/**
 * <head> の先頭寄りで同期実行するスクリプト。
 *  - html.js: JS が動くときだけ [data-reveal] の隠し状態を当てるための印
 *  - BOOT を出さない条件（起動済みフラグ / reduced-motion）なら html.booted と html.boot-done を付ける
 *    （boot-done が付くまで、ヒーローの登場演出は待つ）
 */
const BOOT_SCRIPT = `(function(){var d=document.documentElement;d.classList.add("js");try{if(matchMedia("(prefers-reduced-motion: reduce)").matches||sessionStorage.getItem("na2zora:booted")){d.classList.add("booted","boot-done")}}catch(e){}})();`;

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();

  return (
    <>
      <script dangerouslySetInnerHTML={BOOT_SCRIPT} />
      <title>{head.title}</title>

      <link rel="canonical" href={loc.url.href} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" type="image/avif" href="/favicon.avif" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      {/* フォントの読み込み */}
      <link rel="stylesheet" href="/fonts/common/fonts.css" />
      {/* ファーストビューの名前に使う Anton は先に取りにいく */}
      <link rel="preload" href="/fonts/common/Anton.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />

      {head.meta.map((m) => (
        <meta key={m.key} {...m} />
      ))}

      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}

      {head.styles.map((s) => (
        <style
          key={s.key}
          {...s.props}
          {...(s.props?.dangerouslySetInnerHTML ? {} : { dangerouslySetInnerHTML: s.style })}
        />
      ))}

      {head.scripts.map((s) => (
        <script
          key={s.key}
          {...s.props}
          {...(s.props?.dangerouslySetInnerHTML ? {} : { dangerouslySetInnerHTML: s.script })}
        />
      ))}
    </>
  );
});
