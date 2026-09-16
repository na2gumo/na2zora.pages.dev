import type { RequestHandler } from "@builder.io/qwik-city";
import type { PlatformCloudflarePages } from "@builder.io/qwik-city/middleware/cloudflare-pages";
import { fetchGitHubActivitiesWithCache } from "../../../lib/github";

export const onGet: RequestHandler = async ({ send, headers, platform }) => {
  try {
    const env = (platform as PlatformCloudflarePages | undefined)?.env;
    // 10分（600秒）キャッシュ
    const activities = await fetchGitHubActivitiesWithCache(env, 600);

    headers.set("Content-Type", "application/json; charset=utf-8");
    headers.set("Cache-Control", "public, max-age=60, s-maxage=300");
    send(200, JSON.stringify(activities));
  } catch (err: any) {
    send(500, JSON.stringify({ error: err?.message || "Internal server error" }));
  }
};
