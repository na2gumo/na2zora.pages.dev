import { component$ } from "@builder.io/qwik";
import { useDocumentHead, useLocation } from "@builder.io/qwik-city";

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();

  return (
    <>
      <title>{head.title}</title>

      <link rel="canonical" href={loc.url.href} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" type="image/avif" href="/favicon.avif" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      {/* 画面のちらつき(FOUC)防止：最優先インラインテーマ検出・即時反映スクリプト */}
      <script
        dangerouslySetInnerHTML={`
          (function() {
            try {
              var theme = localStorage.getItem('theme');
              var supportDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (theme === 'dark' || (!theme && supportDark)) {
                document.documentElement.setAttribute('data-theme', 'dark');
              } else {
                document.documentElement.setAttribute('data-theme', 'light');
              }
            } catch (e) {}
          })();
        `}
      />
      {/* ページ専用サブセットフォントの読み込み */}
      {(() => {
        const pathSegments = loc.url.pathname.replace(/^\/|\/$/g, "").split("/");
        // 例: /blog/first-post/ -> /fonts/blog/first-post/fonts.css
        const fontHref =
          pathSegments[0] === "blog" && pathSegments[1]
            ? `/fonts/blog/${pathSegments[1]}/fonts.css`
            : `/fonts/common/fonts.css`;
        return <link rel="stylesheet" href={fontHref} />;
      })()}

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
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: s.style })}
        />
      ))}

      {head.scripts.map((s) => (
        <script
          key={s.key}
          {...s.props}
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: s.script })}
        />
      ))}
    </>
  );
});
