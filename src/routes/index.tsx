import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Cloud } from "../components/cloud/cloud";
import { Constellation } from "../components/constellation/constellation";
import { Hotbar } from "../components/hotbar/hotbar";
import { ProfileCard } from "../components/profile-card/profile-card";
import { weatherFromPushes } from "../lib/sky";
import { useGitHubSky } from "./layout";

// 電線: 電柱の腕木（右上）から画面の左へ垂れ下がる
const WIRES = [
  "M 88.6 7.4 Q 46 26 -2 17",
  "M 91 7.4 Q 50 22 -2 11.5",
  "M 94.2 7.4 Q 56 19 -2 6.5",
  "M 89.6 11.8 Q 44 28 -2 21",
  "M 95.4 11.8 Q 99 13.5 102 13",
  "M 96.4 7.4 Q 99.5 9 102 8.5",
];

export default component$(() => {
  const github = useGitHubSky();
  const { ok, items, pushesThisWeek } = github.value;
  const weather = weatherFromPushes(ok, pushesThisWeek);
  const weatherText = ok
    ? `今週の空模様 ${weather.icon} ${weather.label}`
    : "今週の空模様 観測できず";

  return (
    <>
      {/* 12:00 ── 入道雲の下で */}
      <section class="hero" data-sky-time="12" aria-labelledby="hero-name">
        <svg class="hero__wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {WIRES.map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
        <Cloud variant="tower" class="hero__cloud" />
        <div class="hero__pole" aria-hidden="true" />
        <div class="hero__arms" aria-hidden="true" />

        <div class="hero__inner">
          <h1 id="hero-name" class="hero__name">
            なつぐも
          </h1>
          <div class="hero__meta">
            <picture>
              <source srcset="/avatar.avif" type="image/avif" />
              <img
                class="hero__avatar"
                src="https://avatars.githubusercontent.com/u/266047745?v=4"
                alt=""
                width="44"
                height="44"
                loading="eager"
              />
            </picture>
            <span class="hero__handle">@na2gumo</span>
            <span class="weather-chip">{weatherText}</span>
          </div>
        </div>

        <p class="hero__tagline">
          夏空を君と見上げたあの日を、
          <br />
          私はまだ覚えている。
        </p>

        <p class="hero__cue" aria-hidden="true">
          スクロールすると、日が暮れていきます
        </p>
      </section>

      {/* 15:00 ── プロフィール */}
      <section class="chapter chapter--profile" data-sky-time="15" aria-labelledby="h-profile">
        <header class="chapter__head">
          <p class="chapter__time">15:00</p>
          <h2 id="h-profile" class="chapter__title">
            プロフィール
          </h2>
          <p class="chapter__note">VRChat のプロフィール画面ふうに。</p>
        </header>
        <ProfileCard />
      </section>

      {/* 18:00 ── もちもの */}
      <section class="chapter chapter--items" data-sky-time="18" aria-labelledby="h-items">
        <header class="chapter__head">
          <p class="chapter__time">18:00</p>
          <h2 id="h-items" class="chapter__title">
            もちもの
          </h2>
          <p class="chapter__note">クリックか 1〜9 キーで持ち替えられます。</p>
        </header>
        <Hotbar level={pushesThisWeek} />
      </section>

      {/* 21:00 ── なつぐも座 */}
      <section class="chapter chapter--stars" data-sky-time="21" aria-labelledby="h-stars">
        <header class="chapter__head">
          <p class="chapter__time">21:00</p>
          <h2 id="h-stars" class="chapter__title">
            なつぐも座
          </h2>
          <p class="chapter__note">
            最近の GitHub での活動が星になりました。星を選ぶと、その日のことが読めます。
          </p>
          <p class="weather-chip">
            {weatherText}
            {ok && <span class="weather-chip__sub">push {pushesThisWeek}回</span>}
          </p>
        </header>
        <Constellation items={items} />
        <a class="chapter__more" href="https://github.com/na2gumo" target="_blank" rel="noopener noreferrer">
          GitHub ですべて見る ↗
        </a>
      </section>
    </>
  );
});

export const head: DocumentHead = {
  title: "なつぐも (na2gumo)",
  meta: [
    {
      name: "description",
      content: "なつぐも (na2gumo) のページ。スクロールすると、夏の一日が暮れていきます。",
    },
    {
      name: "theme-color",
      content: "#1a5ed6",
    },
  ],
};
