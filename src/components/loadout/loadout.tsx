import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { SectionHead } from "../section-head/section-head";

type SkillTag = "SKILL" | "HABITAT" | "NEW";
type IconKey = "web" | "unity" | "linux" | "security" | "privacy" | "vrchat" | "minecraft";

interface Skill {
  name: string;
  tag: SkillTag;
  note: string;
  icon: IconKey;
}

// ── 装備スロットのデータ（ここを書き換えれば表示が変わる）──
// 事実以外は書かない。レベルや熟練度の数値は作らない。
const SKILLS: Skill[] = [
  { name: "Web Dev", tag: "SKILL", note: "このサイトも Qwik + Cloudflare Pages 製。", icon: "web" },
  { name: "Unity", tag: "SKILL", note: "スキル・興味", icon: "unity" },
  { name: "Linux", tag: "SKILL", note: "スキル・興味", icon: "linux" },
  { name: "CyberSecurity", tag: "SKILL", note: "スキル・興味", icon: "security" },
  { name: "Privacy", tag: "SKILL", note: "スキル・興味", icon: "privacy" },
  { name: "VRChat", tag: "HABITAT", note: "生息地。", icon: "vrchat" },
  { name: "Minecraft", tag: "NEW", note: "最近手を付けた。", icon: "minecraft" },
];

// メーターの総マス数（EQUIPPED n / 9）
const MAX_SLOTS = 9;

const pad2 = (n: number) => String(n).padStart(2, "0");

/** スロットごとの 96×96 線画アイコン（ライムの 2.5px 線・fill なし・square キャップ） */
const SkillIcon = ({ icon }: { icon: IconKey }) => {
  let shapes;
  switch (icon) {
    case "web":
      // </>
      shapes = (
        <>
          <polyline points="30,28 12,48 30,68" />
          <polyline points="66,28 84,48 66,68" />
          <line x1="56" y1="22" x2="40" y2="74" />
        </>
      );
      break;
    case "unity":
      // アイソメトリックの立方体: 六角形 + 中心から 3 本
      shapes = (
        <>
          <polygon points="48,8 82,28 82,68 48,88 14,68 14,28" />
          <polyline points="14,28 48,48 82,28" />
          <line x1="48" y1="48" x2="48" y2="88" />
        </>
      );
      break;
    case "linux":
      // ターミナル窓 + >_
      shapes = (
        <>
          <rect x="10" y="16" width="76" height="64" />
          <line x1="10" y1="30" x2="86" y2="30" />
          <polyline points="24,44 38,54 24,64" />
          <line x1="46" y1="64" x2="62" y2="64" />
        </>
      );
      break;
    case "security":
      // 盾 + チェック
      shapes = (
        <>
          <path d="M48 8 L84 20 V46 C84 68 68 82 48 90 C28 82 12 68 12 46 V20 Z" />
          <polyline points="32,48 44,60 66,36" />
        </>
      );
      break;
    case "privacy":
      // 南京錠
      shapes = (
        <>
          <rect x="18" y="42" width="60" height="44" />
          <path d="M30 42 V30 A18 18 0 0 1 66 30 V42" />
          <line x1="48" y1="56" x2="48" y2="72" />
        </>
      );
      break;
    case "vrchat":
      // VR ゴーグル: 本体 + レンズ穴 2 つ + 左右のベルト
      shapes = (
        <>
          <rect x="16" y="28" width="64" height="40" rx="8" />
          <circle cx="34" cy="48" r="9" />
          <circle cx="62" cy="48" r="9" />
          <line x1="16" y1="48" x2="4" y2="48" />
          <line x1="80" y1="48" x2="92" y2="48" />
        </>
      );
      break;
    case "minecraft":
      // 草ブロック: 立方体の上面だけジグザグ
      shapes = (
        <>
          <polyline points="14,28 48,8 82,28 82,68 48,88 14,68 14,28" />
          <polyline points="14,28 24,38 30,34 40,44 44,40 48,48 52,40 56,44 66,34 72,38 82,28" />
          <line x1="48" y1="48" x2="48" y2="88" />
        </>
      );
      break;
  }
  return (
    <svg
      class="display__icon"
      viewBox="0 0 96 96"
      width="96"
      height="96"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="square"
      stroke-linejoin="miter"
      aria-hidden="true"
    >
      {shapes}
    </svg>
  );
};

/**
 * CH.02 LOADOUT ── スキルを装備スロットとして見せる。
 * 右（モバイルでは上）のスロットを選ぶと、左のディスプレイが切り替わる。
 * 数字キー 1〜7 と ↑/↓ でも選べる（セクションが 40% 以上見えているとき）。
 */
export const Loadout = component$(() => {
  const selected = useSignal(0);
  const rootRef = useSignal<HTMLElement>();

  // キー操作: セクションの可視率を IntersectionObserver で追い、40% 以上のときだけ受け付ける
  useVisibleTask$(({ cleanup }) => {
    const root = rootRef.value;
    if (!root) return;
    const total = SKILLS.length;

    let ratio = 0;
    const steps = Array.from({ length: 21 }, (_, i) => i / 20);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratio = e.intersectionRatio;
      },
      { threshold: steps }
    );
    io.observe(root);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      if (ratio < 0.4) return;
      // フォーム入力中は奪わない
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;

      let next = -1;
      if (/^[1-9]$/.test(e.key)) {
        const i = Number(e.key) - 1;
        if (i < total) next = i;
      } else if (e.key === "ArrowDown") {
        next = (selected.value + 1) % total;
      } else if (e.key === "ArrowUp") {
        next = (selected.value - 1 + total) % total;
      }
      if (next < 0) return;

      e.preventDefault();
      selected.value = next;
      // タブにフォーカスがあるときは、フォーカスも選択に追従させる
      if (document.activeElement?.getAttribute("role") === "tab") {
        root.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    cleanup(() => {
      io.disconnect();
      window.removeEventListener("keydown", onKeyDown);
    });
  });

  const cur = SKILLS[selected.value];
  const num = pad2(selected.value + 1);

  return (
    <section id="loadout" class="ch-section loadout" aria-labelledby="loadout-title" ref={rootRef}>
      <SectionHead index="02" title="LOADOUT" sub="装備スキル" id="loadout-title" />

      <div class="loadout__grid">
        {/* スロット一覧 */}
        <div class="loadout__slots" data-reveal="up" style={{ "--i": 1 }}>
          <div class="slots" role="tablist" aria-label="装備スキル" aria-orientation="vertical">
            {SKILLS.map((s, i) => (
              <button
                key={s.name}
                type="button"
                role="tab"
                id={`loadout-tab-${i}`}
                aria-selected={i === selected.value}
                aria-controls="loadout-panel"
                tabIndex={i === selected.value ? 0 : -1}
                class={{ slot: true, "slot--on": i === selected.value }}
                onClick$={() => {
                  selected.value = i;
                }}
              >
                <span class="slot__no">{pad2(i + 1)}</span>
                <span class="slot__name">{s.name}</span>
                <span class={["slot__tag", "mono-label", `slot__tag--${s.tag.toLowerCase()}`]}>{s.tag}</span>
              </button>
            ))}
          </div>

          <div class="equipped">
            <span class="mono-label">
              EQUIPPED {SKILLS.length} / {MAX_SLOTS}
            </span>
            <div class="equipped__meter" aria-hidden="true">
              {Array.from({ length: MAX_SLOTS }, (_, i) => (
                <span key={i} class={{ equipped__cell: true, "equipped__cell--on": i < SKILLS.length }} />
              ))}
            </div>
          </div>
        </div>

        {/* ディスプレイ */}
        <div class="loadout__display" data-reveal="up" style={{ "--i": 0 }}>
          <div
            class="display"
            role="tabpanel"
            id="loadout-panel"
            aria-labelledby={`loadout-tab-${selected.value}`}
          >
            {/* key で再マウントし、選択のたびに切り替え演出（CSS アニメーション）を再生する */}
            <div class="display__stage" key={selected.value}>
              <span class="display__flash" aria-hidden="true" />
              <span class="display__bignum" aria-hidden="true">
                {num}
              </span>

              <div class="display__top">
                <span class={["sticker", "display__tag", `display__tag--${cur.tag.toLowerCase()}`]}>
                  <span>{cur.tag}</span>
                </span>
                <span class="mono-label">SLOT {num}</span>
              </div>

              <div class="display__main">
                <SkillIcon icon={cur.icon} />
                <h3 class="display__name">{cur.name}</h3>
                <p class="display__note">{cur.note}</p>
              </div>

              <p class="mono-label display__hint">PRESS 1-{SKILLS.length} / ↑↓ TO SWITCH</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
