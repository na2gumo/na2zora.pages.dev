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
      {/* ヒーローセクション */}
      <section class="hero-section">
        <div class="avatar-wrapper">
          <picture>
            <source srcset="/avatar.avif" type="image/avif" />
            <img
              src="https://avatars.githubusercontent.com/u/266047745?v=4"
              alt="なつぐも (na2gumo)"
              width="128"
              height="128"
              class="avatar"
              loading="eager"
            />
          </picture>
        </div>
        <h1 class="hero-name">なつぐも</h1>
        <p class="hero-handle">@na2gumo</p>
        <p class="hero-tagline">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
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
        <h2>About</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
      </section>

      {/* Skills / Interests セクション */}
      <section class="section">
        <h2>Skills & Interests</h2>
        <div class="skills-grid">
          <span class="skill-tag">Skill 1</span>
          <span class="skill-tag">Skill 2</span>
          <span class="skill-tag">Skill 3</span>
          <span class="skill-tag">Skill 4</span>
          <span class="skill-tag">Skill 5</span>
        </div>
      </section>

      {/* Recent Posts セクション */}
      <section class="section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0, border: "none", padding: 0 }}>Recent Posts</h2>
          <Link href="/blog/" style={{ fontSize: "0.9rem" }}>
            View all →
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {latestPosts.value.map((post) => (
            <article
              key={post.slug}
              class="post-card"
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
  title: "なつぐも (na2gumo)",
  meta: [
    {
      name: "description",
      content: "Personal portfolio and blog",
    },
  ],
};
