import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import type { PlatformCloudflarePages } from "@builder.io/qwik-city/middleware/cloudflare-pages";
import { Boot } from "../components/boot/boot";
import { Cursor } from "../components/cursor/cursor";
import { Hud } from "../components/hud/hud";
import { Motion } from "../components/motion/motion";
import { SiteFooter } from "../components/site-footer/site-footer";
import { fetchGitHubActivitiesWithCache, type GitHubFeed } from "../lib/github";

export const useGitHubFeed = routeLoader$<GitHubFeed>(async (event) => {
  // Cloudflare Pages の env（KV バインディングを含む）を取得
  const platform = event.platform as PlatformCloudflarePages | undefined;
  // 15分（900秒）キャッシュ
  return await fetchGitHubActivitiesWithCache(platform?.env, 900);
});

export default component$(() => {
  const feed = useGitHubFeed().value;

  return (
    <>
      <div class="bg" aria-hidden="true" />
      <Boot ok={feed.ok} pushes={feed.pushesThisWeek} />
      <Hud />
      <Cursor />
      <Motion />

      <main>
        <Slot />
      </main>

      <SiteFooter />
      <div class="crt" aria-hidden="true" />
    </>
  );
});
