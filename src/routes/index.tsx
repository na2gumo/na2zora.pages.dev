import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ActivityLog } from "../components/activity-log/activity-log";
import { AgentFile } from "../components/agent-file/agent-file";
import { Hero } from "../components/hero/hero";
import { Loadout } from "../components/loadout/loadout";
import { useGitHubFeed } from "./layout";

export default component$(() => {
  const feed = useGitHubFeed().value;

  return (
    <>
      <Hero ok={feed.ok} pushes={feed.pushesThisWeek} />
      <AgentFile feed={feed} />
      <Loadout />
      <ActivityLog feed={feed} />
    </>
  );
});

export const head: DocumentHead = {
  title: "なつぐも (na2gumo) — NA2ZORA TERMINAL",
  meta: [
    {
      name: "description",
      content: "開発者 なつぐも (na2gumo) のポートフォリオ。",
    },
    {
      name: "theme-color",
      content: "#09090b",
    },
    {
      property: "og:title",
      content: "なつぐも (na2gumo) — NA2ZORA TERMINAL",
    },
    {
      property: "og:description",
      content: "開発者 なつぐも (na2gumo) のポートフォリオ。",
    },
  ],
};
