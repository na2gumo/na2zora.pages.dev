import { component$, Slot } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";

export default component$(() => {
  const loc = useLocation();
  const isPostPage = loc.url.pathname !== "/blog/" && loc.url.pathname !== "/blog";

  return (
    <div class="blog-layout">
      {isPostPage && (
        <nav style={{ marginBottom: "1.5rem" }}>
          <Link href="/blog/" style={{ fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            ← 記事一覧に戻る
          </Link>
        </nav>
      )}

      <article class="blog-content">
        <Slot />
      </article>

      {isPostPage && (
        <footer style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px dashed var(--color-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <Link href="/blog/">← すべての記事を見る</Link>
            <a href="https://twitter.com/intent/tweet" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem" }}>
              X (Twitter) で共有
            </a>
          </div>
        </footer>
      )}
    </div>
  );
});
