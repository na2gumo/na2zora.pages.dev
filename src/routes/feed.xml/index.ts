import type { RequestHandler } from "@builder.io/qwik-city";
import { Feed } from "feed";
import { getAllPosts } from "../../lib/posts";

export const onGet: RequestHandler = async ({ send, headers }) => {
  const siteUrl = "https://na2zora.pages.dev";
  const posts = getAllPosts();

  const feed = new Feed({
    title: "na2zora Blog",
    description: "na2zora's personal blog and tech notes",
    id: siteUrl,
    link: siteUrl,
    language: "ja",
    image: `${siteUrl}/favicon.svg`,
    favicon: `${siteUrl}/favicon.svg`,
    copyright: `All rights reserved ${new Date().getFullYear()}, na2zora`,
    updated: posts.length > 0 ? new Date(posts[0].date) : new Date(),
    generator: "Feed for Qwik City",
    feedLinks: {
      atom: `${siteUrl}/feed.xml`,
    },
    author: {
      name: "na2zora",
      link: siteUrl,
    },
  });

  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: `${siteUrl}/blog/${post.slug}/`,
      link: `${siteUrl}/blog/${post.slug}/`,
      description: post.description,
      date: new Date(post.date),
    });
  });

  const rssXml = feed.atom1();

  headers.set("Content-Type", "application/xml; charset=utf-8");
  headers.set("Cache-Control", "public, max-age=3600");
  send(200, rssXml);
};
