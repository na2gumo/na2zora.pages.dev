import { component$ } from "@builder.io/qwik";
import { Link, type DocumentHead, routeLoader$ } from "@builder.io/qwik-city";
import type { PlatformCloudflarePages } from "@builder.io/qwik-city/middleware/cloudflare-pages";
import { getAllPosts, type BlogPost } from "../lib/posts";
import { fetchGitHubActivitiesWithCache, type GitHubActivityItem } from "../lib/github";

export const useLatestPosts = routeLoader$<BlogPost[]>(() => {
  return getAllPosts().slice(0, 3);
});

export const useGitHubActivities = routeLoader$<GitHubActivityItem[]>(async (event) => {
  // Cloudflare Pages の env（KV バインディング）を取得
  const platform = event.platform as PlatformCloudflarePages | undefined;
  // 15分（900秒）キャッシュ
  return await fetchGitHubActivitiesWithCache(platform?.env, 900);
});

export default component$(() => {
  const latestPosts = useLatestPosts();
  const githubActivities = useGitHubActivities();

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

      {/* GitHub Activity セクション */}
      <section class="section">
        <h2>Recent GitHub Activity</h2>

        {githubActivities.value.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            No recent activity found or unable to fetch GitHub events.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {githubActivities.value.map((activity) => (
              <details key={activity.id} class="activity-card">
                <summary class="activity-summary">
                  <div class="activity-header">
                    <time style={{ color: "var(--color-text-muted)" }}>{activity.date}</time>
                  </div>
                  <div class="activity-title">
                    <span style={{ marginRight: "0.4rem" }}>{activity.actionText}</span>
                    <a
                      href={activity.targetUrl || activity.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick$={(e) => e.stopPropagation()}
                    >
                      {activity.repoName}
                    </a>
                  </div>
                </summary>

                {activity.detailsList && activity.detailsList.length > 0 ? (
                  <div class="activity-expanded-details">
                    <ul class="activity-commits-list">
                      {activity.detailsList.map((item, idx) => (
                        <li key={idx} class="activity-commit-item">
                          {item.sha && (
                            <span class="commit-sha">{item.sha}</span>
                          )}
                          <span class="commit-msg">
                            {item.url ? (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {item.message}
                              </a>
                            ) : (
                              item.message
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : activity.detail ? (
                  <div class="activity-expanded-details">
                    <p class="activity-detail">{activity.detail}</p>
                  </div>
                ) : null}
              </details>
            ))}

            <div style={{ marginTop: "0.5rem" }}>
              <a
                href="https://github.com/na2gumo"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
                class="activity-view-all"
              >
                View all →
              </a>
            </div>
          </div>
        )}
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
