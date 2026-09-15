import matter from "gray-matter";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
}

// Viteのimport.meta.globを使用して、ビルド時にsrc/routes/blog/**/index.mdxのRAW文字列を一括取得
const mdxModules = import.meta.glob("/src/routes/blog/**/index.mdx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const getAllPosts = (): BlogPost[] => {
  const posts: BlogPost[] = [];

  for (const [filePath, content] of Object.entries(mdxModules)) {
    // 例: "/src/routes/blog/first-post/index.mdx" -> slug: "first-post"
    const match = filePath.match(/\/src\/routes\/blog\/(.+)\/index\.mdx$/);
    if (!match) continue;

    const slug = match[1];
    const { data } = matter(content);

    posts.push({
      slug,
      title: data.title || slug,
      description: data.description || "",
      date: data.date ? String(data.date) : "2026-01-01",
    });
  }

  // 新しい日付順にソート
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
};
