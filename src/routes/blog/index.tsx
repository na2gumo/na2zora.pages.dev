import { component$ } from "@builder.io/qwik";
import { Link, type DocumentHead, routeLoader$ } from "@builder.io/qwik-city";
import { getAllPosts, type BlogPost } from "../../lib/posts";

export const useBlogPosts = routeLoader$<BlogPost[]>(() => {
  return getAllPosts();
});

export default component$(() => {
  const posts = useBlogPosts();

  return (
    <div class="blog-index">
      <h1>Blog</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
        Placeholder blog subtitle or description.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {posts.value.map((post) => (
          <article
            key={post.slug}
            style={{
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            <time style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              {post.date}
            </time>
            <h2 style={{ margin: "0.25rem 0 0.5rem", fontSize: "1.25rem" }}>
              <Link href={`/blog/${post.slug}/`}>{post.title}</Link>
            </h2>
            <p style={{ margin: 0, fontSize: "0.95rem" }}>{post.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Blog",
  meta: [
    {
      name: "description",
      content: "Blog posts archive",
    },
  ],
};
