import { component$ } from "@builder.io/qwik";
import { SectionHead } from "../section-head/section-head";

type IconKey = "web" | "unity" | "linux" | "security" | "privacy" | "vrchat" | "minecraft";

interface Skill {
  name: string;
  icon: IconKey;
}

// ── 装備スキルのデータ（ここを書き換えれば表示が変わる）──
// 事実以外は書かない。レベルや熟練度の数値は作らない。
const SKILLS: Skill[] = [
  { name: "Web Dev", icon: "web" },
  { name: "Unity", icon: "unity" },
  { name: "Linux", icon: "linux" },
  { name: "CyberSecurity", icon: "security" },
  { name: "Privacy", icon: "privacy" },
  { name: "VRChat", icon: "vrchat" },
  { name: "Minecraft", icon: "minecraft" },
];

// メーターの総マス数（EQUIPPED n / 9）
const MAX_SLOTS = 9;

const pad2 = (n: number) => String(n).padStart(2, "0");

/** スキルごとの 96×96 線画アイコン（アクセント色の 2.5px 線・fill なし・square キャップ） */
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
      class="skill__icon"
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
 * CH.02 LOADOUT ── スキルを装備スロットとして全部横並びで見せる。
 * アイコンと名前だけ。クリックして切り替える操作はない。
 */
export const Loadout = component$(() => {
  return (
    <section id="loadout" class="ch-section loadout" aria-labelledby="loadout-title">
      <SectionHead index="02" title="LOADOUT" sub="装備スキル" id="loadout-title" />

      <ul class="skills">
        {SKILLS.map((s, i) => (
          <li key={s.name} class="skills__item" data-reveal="pop" style={{ "--i": i }}>
            <div class="skill">
              <span class="skill__no">{pad2(i + 1)}</span>
              <SkillIcon icon={s.icon} />
              <h3 class="skill__name">{s.name}</h3>
            </div>
          </li>
        ))}
      </ul>

      <div class="equipped" data-reveal="up" style={{ "--i": 3 }}>
        <span class="mono-label">
          EQUIPPED {SKILLS.length} / {MAX_SLOTS}
        </span>
        <div class="equipped__meter" aria-hidden="true">
          {Array.from({ length: MAX_SLOTS }, (_, i) => (
            <span key={i} class={{ equipped__cell: true, "equipped__cell--on": i < SKILLS.length }} />
          ))}
        </div>
      </div>
    </section>
  );
});
