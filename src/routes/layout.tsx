import { $, component$, Slot } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import type { PlatformCloudflarePages } from "@builder.io/qwik-city/middleware/cloudflare-pages";
import { Sky } from "../components/sky/sky";
import { SkyClock } from "../components/sky-clock/sky-clock";
import { Sparkles } from "../components/sparkles/sparkles";
import { fetchGitHubActivitiesWithCache, type GitHubSky } from "../lib/github";
import { DAY_START, weatherFromPushes } from "../lib/sky";

export const useGitHubSky = routeLoader$<GitHubSky>(async (event) => {
  // Cloudflare Pages の env（KV バインディングを含む）を取得
  const platform = event.platform as PlatformCloudflarePages | undefined;
  // 15分（900秒）キャッシュ
  return await fetchGitHubActivitiesWithCache(platform?.env, 900);
});

export default component$(() => {
  const github = useGitHubSky();
  const weather = weatherFromPushes(github.value.ok, github.value.pushesThisWeek);

  const backToNoon = $(() => {
    document.dispatchEvent(new CustomEvent("sky:goto", { detail: { t: DAY_START } }));
  });

  return (
    <>
      <Sky weather={weather.kind} />
      <Sparkles />

      <header class="site-header">
        <a href="/" class="site-header__brand">
          na2zora
        </a>
        <SkyClock />
      </header>

      <main>
        <Slot />
      </main>

      <footer class="site-footer" data-sky-time="24">
        <p class="site-footer__time">24:00</p>
        <p class="site-footer__night">おやすみなさい。</p>
        <p class="site-footer__sub">また明日、夏空の下で。</p>
        <button type="button" class="site-footer__again" onClick$={backToNoon}>
          もう一度、昼から ↑
        </button>
        <p class="site-footer__copy">
          © {new Date().getFullYear()} na2zora. Built with Qwik & Cloudflare Pages.
        </p>
      </footer>
    </>
  );
});
