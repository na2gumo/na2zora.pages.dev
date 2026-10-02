import { component$ } from "@builder.io/qwik";
import type { GitHubFeed } from "../../lib/github";
import { formatJstStamp } from "../../lib/format";
import { SectionHead } from "../section-head/section-head";

const AVATAR_FALLBACK = "https://avatars.githubusercontent.com/u/266047745?v=4";

/**
 * CH.01 AGENT FILE ── プロフィールを資料カードとして見せる。
 * 取得失敗時、ステータスの値はすべて `--`。
 */
export const AgentFile = component$<{ feed: GitHubFeed }>(({ feed }) => {
  const { ok, items, pushesThisWeek } = feed;
  const latest = ok ? items[0] : undefined;

  const stats = [
    {
      label: "PUSH / 7D",
      value: ok ? String(pushesThisWeek) : "--",
      tone: "lime",
    },
    {
      label: "EVENTS",
      value: ok ? String(items.length) : "--",
      tone: "ink",
    },
    {
      label: "LAST SIGNAL",
      value: latest ? formatJstStamp(latest.createdAt) : "--",
      tone: "ink",
    },
  ];

  return (
    <section id="agent" class="ch-section agent" aria-labelledby="agent-title">
      <SectionHead index="01" title="AGENT FILE" sub="エージェント資料" id="agent-title" />

      <div class="dossier" data-reveal>
        <div class="dossier__panel">
          <div class="dossier__bar">
            <span class="mono-label">FILE: AGENT_na2gumo.dat</span>
            <span class="mono-label dossier__clearance">CLEARANCE: PUBLIC</span>
          </div>

          <div class="dossier__body">
            <div class="dossier__side">
              <div class="dossier__photo-wrap">
                <div class="dossier__photo">
                  {/* avif が読めないブラウザは GitHub のアイコンにフォールバックする */}
                  <picture>
                    <source srcset="/avatar.avif" type="image/avif" />
                    <img
                      src={AVATAR_FALLBACK}
                      alt="なつぐも (na2gumo) のアイコン"
                      width="280"
                      height="280"
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </div>
                <span class="dossier__stamp" data-reveal="slam" style={{ "--i": 6 }} aria-hidden="true">
                  VERIFIED
                </span>
              </div>
              <div class="dossier__barcode" aria-hidden="true" />
              <span class="mono-label dossier__id">ID-na2gumo</span>
            </div>

            <div class="dossier__main">
              <dl class="attrs">
                <div class="attrs__row" data-reveal="up" style={{ "--i": 1 }}>
                  <dt class="mono-label">NAME</dt>
                  <dd>
                    <span class="attrs__name">なつぐも</span> <span class="attrs__handle">(na2gumo)</span>
                  </dd>
                </div>
                <div class="attrs__row" data-reveal="up" style={{ "--i": 2 }}>
                  <dt class="mono-label">CLASS</dt>
                  <dd>Developer / Student</dd>
                </div>
                <div class="attrs__row" data-reveal="up" style={{ "--i": 3 }}>
                  <dt class="mono-label">HABITAT</dt>
                  <dd>VRChat</dd>
                </div>
                <div class="attrs__row" data-reveal="up" style={{ "--i": 4 }}>
                  <dt class="mono-label">LANGUAGE</dt>
                  <dd>日本語</dd>
                </div>
                <div class="attrs__row" data-reveal="up" style={{ "--i": 5 }}>
                  <dt class="mono-label">CURRENTLY</dt>
                  <dd>Minecraft にも手を付けたり</dd>
                </div>
                <div class="attrs__row" data-reveal="up" style={{ "--i": 6 }}>
                  <dt class="mono-label">LINK</dt>
                  <dd>
                    <a
                      class="attrs__link"
                      href="https://github.com/na2gumo"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      github.com/na2gumo ↗
                    </a>
                  </dd>
                </div>
              </dl>

              <div class="bio" data-reveal="up" style={{ "--i": 7 }}>
                <span class="mono-label">// BIO</span>
                <p class="bio__text">VRChatに生息している学生です。最近はMinecraftにも手を付けたり。</p>
              </div>

              <div class="stats">
                {stats.map((s, n) => (
                  <div class="stat-wrap" key={s.label} data-reveal="pop" style={{ "--i": 8 + n }}>
                    <div class={{ stat: true, "stat--dead": s.value === "--" }}>
                      <span class="mono-label">{s.label}</span>
                      <span class={["stat__value", `stat__value--${s.tone}`]}>{s.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
