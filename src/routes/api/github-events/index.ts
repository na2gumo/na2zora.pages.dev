import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async ({ send, headers }) => {
  try {
    const res = await fetch("https://api.github.com/users/na2gumo/events/public?per_page=15", {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "na2zora-portfolio",
      },
    });

    if (!res.ok) {
      send(res.status, JSON.stringify({ error: `GitHub API error: ${res.statusText}` }));
      return;
    }

    const events = await res.json();

    headers.set("Content-Type", "application/json; charset=utf-8");
    headers.set("Cache-Control", "public, max-age=60, s-maxage=300");
    send(200, JSON.stringify(events));
  } catch (err: any) {
    send(500, JSON.stringify({ error: err?.message || "Internal server error" }));
  }
};
