import { component$ } from "@builder.io/qwik";
import { Link, type DocumentHead, routeLoader$ } from "@builder.io/qwik-city";
import { getAllPosts, type BlogPost } from "../lib/posts";

export const useLatestPosts = routeLoader$<BlogPost[]>(() => {
  return getAllPosts().slice(0, 3);
});

export default component$(() => {
  const latestPosts = useLatestPosts();

  return (
    <div class="portfolio-home">
      {/* ヒーローセクション（中央揃えアイコン + なつぐも + 自己紹介） */}
      <section class="hero-section">
        <div class="avatar-wrapper">
          <img
            src="https://avatars.githubusercontent.com/u/266047745?v=4"
            alt="なつぐも (na2gumo)"
            width="128"
            height="128"
            class="avatar"
            loading="eager"
          />
        </div>
        <h1 class="hero-name">なつぐも</h1>
        <p class="hero-handle">@na2gumo / na2zora</p>
        <p class="hero-tagline">
          Webフロントエンド、新しい技術スタック、そして #VRChat が好きな開発者です。
          思考の断片や技術的な学びをここに記録しています。
        </p>
        <div class="social-links">
          <a
            href="https://github.com/na2gumo"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <Link href="/blog/">
            Blog
          </Link>
          <Link href="/feed.xml" target="_blank" rel="noopener noreferrer">
            RSS
          </Link>
        </div>
      </section>

      {/* About セクション */}
      <section class="section">
        <h2>About Me</h2>
        <p>
          こんにちは、なつぐもです。シンプルで軽量、表示速度に妥協しないWebサイトが好きです。
          このサイトは Qwik City と Cloudflare Pages をベースに、SCSS、ページ単位のサブセットフォント（BIZ UDゴシック / Geist Mono）など、
          こだわりを詰め込んで制作しています。
        </p>
      </section>

      {/* Skills / Interests セクション */}
      <section class="section">
        <h2>Interests & Tech Stack</h2>
        <div class="skills-grid">
          <span class="skill-tag">TypeScript</span>
          <span class="skill-tag">Qwik City</span>
          <span class="skill-tag">Cloudflare Pages</span>
          <span class="skill-tag">SCSS</span>
          <span class="skill-tag">MDX</span>
          <span class="skill-tag">pnpm</span>
          <span class="skill-tag">VRChat</span>
        </div>
      </section>

      {/* Latest Blog Posts セクション */}
      <section class="section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0, border: "none", padding: 0 }}>Recent Posts</h2>
          <Link href="/blog/" style={{ fontSize: "0.9rem" }}>
            すべての記事を見る →
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {latestPosts.value.map((post) => (
            <article
              key={post.slug}
              style={{
                padding: "0.85rem 1rem",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
              }}
            >
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                {post.date}
              </div>
              <h3 style={{ margin: "0.2rem 0", fontSize: "1.1rem" }}>
                <Link href={`/blog/${post.slug}/`}>{post.title}</Link>
              </h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
                {post.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: "なつぐも (na2gumo) - Portfolio & Blog",
  meta: [
    {
      name: "description",
      content: "なつぐも (na2gumo) の個人ポートフォリオ＆ブログサイト",
    },
  ],
};
