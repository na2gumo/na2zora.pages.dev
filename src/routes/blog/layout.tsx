import { component$, Slot } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import { getPostBySlug } from "../../lib/posts";

export default component$(() => {
  const loc = useLocation();
  const pathSegments = loc.url.pathname.replace(/^\/|\/$/g, "").split("/");
  const isPostPage = pathSegments[0] === "blog" && Boolean(pathSegments[1]);
  const currentSlug = isPostPage ? pathSegments[1] : "";
  const post = currentSlug ? getPostBySlug(currentSlug) : undefined;

  const pageTitle = post?.title || "Blog";
  const shareUrl = loc.url.href;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(pageTitle)}&url=${encodeURIComponent(shareUrl)}`;

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
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X (Twitter) で共有
            </a>
          </div>
        </footer>
      )}
    </div>
  );
});
