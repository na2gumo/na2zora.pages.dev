import { component$ } from "@builder.io/qwik";
import type { GitHubFeed } from "../../lib/github";
import { SectionHead } from "../section-head/section-head";

const AVATAR_FALLBACK = "https://avatars.githubusercontent.com/u/266047745?v=4";

/** ステータスバーのセグメント数 */
const SEGMENTS = 10;

/** 値を 0〜SEGMENTS の点灯数に丸める */
const clampLit = (n: number) => Math.max(0, Math.min(SEGMENTS, Math.round(n)));

// avif が読めないブラウザは GitHub のアイコンにフォールバックする
const Avatar = ({ alt, lazy = true }: { alt: string; lazy?: boolean }) => (
  <picture>
    <source srcset="/avatar.avif" type="image/avif" />
    <img
      src={AVATAR_FALLBACK}
      alt={alt}
      width="480"
      height="480"
      loading={lazy ? "lazy" : undefined}
      decoding="async"
    />
  </picture>
);

const TILES = [
  { label: "HABITAT", value: "VRChat", mono: false },
  { label: "LANGUAGE", value: "日本語", mono: false },
  { label: "CURRENTLY", value: "Minecraft", mono: false },
  { label: "HANDLE", value: "@na2gumo", mono: true },
];

/**
 * CH.01 AGENT FILE ── ゲームのエージェント選択画面。
 * 左に矢印型のポートレート、右に名前・クラス・実データのステータスバー・属性・SELECT ボタン。
 * 取得失敗時、ステータスの値は `--`、セグメントはすべて消灯。
 */
export const AgentFile = component$<{ feed: GitHubFeed }>(({ feed }) => {
  const { ok, items, pushesThisWeek, pushesByDay } = feed;
  const activeDays = ok ? pushesByDay.filter((n) => n >= 1).length : 0;

  const stats = [
    {
      label: "PUSH / 7D",
      value: ok ? String(pushesThisWeek) : "--",
      lit: ok ? clampLit(Math.min(pushesThisWeek, SEGMENTS)) : 0,
    },
    {
      label: "EVENTS",
      value: ok ? String(items.length) : "--",
      lit: ok ? clampLit((items.length / 12) * SEGMENTS) : 0,
    },
    {
      label: "ACTIVE DAYS / 14D",
      value: ok ? String(activeDays) : "--",
      lit: ok ? clampLit((activeDays / 14) * SEGMENTS) : 0,
    },
  ];

  return (
    <section id="agent" class="ch-section agent" aria-labelledby="agent-title">
      <SectionHead index="01" title="AGENT FILE" sub="エージェント資料" id="agent-title" />

      <div class="select">
        {/* ---- 左: ポートレート ---- */}
        <div class="select__stage">
          {/* 背面レイヤー（クリップされない兄弟要素） */}
          <div class="select__halftone" aria-hidden="true" />
          <span class="select__word" data-reveal="up" style={{ "--i": 2 }} aria-hidden="true">
            AGENT
          </span>

          <div class="select__portrait">
            {/* data-reveal のワイプは矢印型クリップの内側で行う */}
            <div class="select__reveal" data-reveal>
              <div class="select__art">
                <Avatar alt="なつぐも (na2gumo) のアイコン" />
                {/* ホバー時の RGB ずれ用の複製 */}
                <div class="select__ghost select__ghost--a" aria-hidden="true">
                  <Avatar alt="" />
                </div>
                <div class="select__ghost select__ghost--b" aria-hidden="true">
                  <Avatar alt="" />
                </div>
              </div>
              <div class="select__fade" aria-hidden="true" />
              <div class="select__lines" aria-hidden="true" />

              <p class="select__tag select__tag--tl" aria-hidden="true">
                <span class="select__tag-main">AGENT No.01</span>
                <span class="select__tag-sub">{"// SELECT"}</span>
              </p>

              <div class="select__emblem" aria-hidden="true">
                <span class="select__emblem-ring" />
                <span class="select__emblem-text">N2Z</span>
              </div>

              <p class="select__tag select__tag--bl" aria-hidden="true">
                <span class="select__tag-main">CAM: PROFILE</span>
                <span class="select__rec">
                  <span class="dot dot--blink dot--pink" /> REC
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* ---- 右: 情報 ---- */}
        <div class="select__info">
          <div class="select__head" data-reveal="up">
            <span class="mono-label">{"// SELECT AGENT"}</span>
            <span class="mono-label select__count">01 / 01</span>
          </div>

          <div class="select__name-wrap" data-reveal="up" style={{ "--i": 1 }}>
            <h3 class="select__name" data-text="NA2GUMO" aria-label="なつぐも (na2gumo)">
              NA2GUMO
            </h3>
          </div>

          <div class="select__jp-wrap" data-reveal="pop" style={{ "--i": 2 }}>
            <p class="sticker sticker--lime select__jp">
              <span>なつぐも</span>
            </p>
          </div>

          <ul class="select__classes">
            {["DEVELOPER", "STUDENT"].map((c, n) => (
              <li key={c} data-reveal="pop" style={{ "--i": 3 + n }}>
                <span class="select__class">
                  <span class="select__class-in">
                    <span class="select__diamond" aria-hidden="true" />
                    {c}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div class="select__stats">
            {stats.map((s, n) => (
              <div
                key={s.label}
                class={{ "select__stat": true, "select__stat--dead": !ok }}
                data-reveal="up"
                style={{ "--i": 4 + n }}
              >
                <span class="mono-label select__stat-label">{s.label}</span>
                <span class="select__bar" aria-hidden="true">
                  {Array.from({ length: SEGMENTS }, (_, k) => (
                    <i
                      key={k}
                      class={{
                        "select__seg": true,
                        "select__seg--on": k < s.lit,
                        "select__seg--tip": s.lit > 0 && k === s.lit - 1,
                      }}
                      style={{ "--s": k }}
                    />
                  ))}
                </span>
                <span class="select__stat-value">{s.value}</span>
              </div>
            ))}
          </div>

          <dl class="select__tiles">
            {TILES.map((t, n) => (
              <div key={t.label} class="select__tile" data-reveal="pop" style={{ "--i": 7 + n }}>
                <dt class="mono-label">{t.label}</dt>
                <dd class={{ "select__tile-value": true, "select__tile-value--mono": t.mono }}>{t.value}</dd>
              </div>
            ))}
          </dl>

          <div class="select__bio" data-reveal="up" style={{ "--i": 11 }}>
            <p class="select__bio-text">VRChatに生息している学生です。最近はMinecraftにも手を付けたり。</p>
          </div>

          <div class="select__go-wrap" data-reveal="up" style={{ "--i": 12 }}>
            <a
              class="btn btn--primary select__go"
              href="https://github.com/na2gumo"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>SELECT</span>
              <span class="btn__arrow select__tri" aria-hidden="true" />
              <span>GITHUB</span>
              {/* ↵ はフォントに字形が無いので SVG で描く */}
              <kbd class="select__key" aria-hidden="true">
                <svg viewBox="0 0 16 12" width="16" height="12" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path d="M14 1v5H3M6 2.5 2.5 6 6 9.5" />
                </svg>
              </kbd>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});
