import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { HEART, SPRITES, toRects, type SpriteName } from "./sprites";

interface Item {
  name: string;
  sprite: SpriteName;
  lore: string[];
}

// 9 マス。空きスロットもそのまま残すのがホットバーらしさ
const ITEMS: (Item | null)[] = [
  { name: "Web Dev", sprite: "web", lore: ["スキル・興味", "このサイトも Qwik 製"] },
  { name: "Unity", sprite: "cube", lore: ["スキル・興味"] },
  { name: "Linux", sprite: "penguin", lore: ["スキル・興味"] },
  { name: "CyberSecurity", sprite: "shield", lore: ["スキル・興味"] },
  { name: "Privacy", sprite: "lock", lore: ["スキル・興味"] },
  { name: "VRChat", sprite: "headset", lore: ["生息地"] },
  { name: "Minecraft", sprite: "grass", lore: ["最近手を付けた"] },
  null,
  null,
];

const Pixels = component$<{ rows: readonly string[]; size: number; class?: string }>(
  ({ rows, size, class: cls }) => (
    <svg
      class={cls}
      viewBox={`0 0 ${rows[0].length} ${rows.length}`}
      width={size}
      height={size}
      shape-rendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {toRects(rows).map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
      ))}
    </svg>
  )
);

interface HotbarProps {
  /** XP レベルとして表示する値（今週の push 回数） */
  level: number;
}

/**
 * Minecraft のホットバー風のスキル一覧。
 * クリック、または画面に見えている間は 1〜9 キーで持ち替えられる。
 */
export const Hotbar = component$<HotbarProps>(({ level }) => {
  const selected = useSignal(0);
  // 持ち替えるたびにアイテム名のアニメーションをやり直すためのキー
  const swaps = useSignal(0);
  const rootRef = useSignal<HTMLElement>();

  const select = $((i: number) => {
    selected.value = i;
    swaps.value++;
  });

  useVisibleTask$(({ cleanup }) => {
    let visible = false;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), {
      threshold: 0.4,
    });
    io.observe(rootRef.value!);

    const onKey = (e: KeyboardEvent) => {
      if (!visible || e.altKey || e.ctrlKey || e.metaKey) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= 9) {
        selected.value = n - 1;
        swaps.value++;
      }
    };
    window.addEventListener("keydown", onKey);
    cleanup(() => {
      io.disconnect();
      window.removeEventListener("keydown", onKey);
    });
  });

  const item = ITEMS[selected.value];

  return (
    <div class="hotbar" ref={rootRef}>
      <p class="hotbar__item-name" key={swaps.value} aria-hidden="true">
        {item?.name ?? ""}
      </p>

      <div class="hotbar__status" aria-hidden="true">
        <div class="hotbar__hearts">
          {Array.from({ length: 10 }, (_, i) => (
            <Pixels key={i} rows={HEART} size={14} class="hotbar__heart" />
          ))}
        </div>
        <div class="hotbar__xp" title="XP レベル = 今週の push 回数">
          <span class="hotbar__level">{level}</span>
          <div class="hotbar__xp-bar">
            <div class="hotbar__xp-fill" style={{ width: `${Math.min(level, 10) * 10}%` }} />
          </div>
        </div>
      </div>

      <div class="hotbar__slots" role="toolbar" aria-label="もちもの（1〜9 キーで持ち替え）">
        {ITEMS.map((it, i) => (
          <button
            key={i}
            type="button"
            class={["hotbar__slot", selected.value === i && "is-selected"]}
            aria-pressed={selected.value === i}
            aria-label={it ? `${i + 1}: ${it.name}` : `${i + 1}: 空きスロット`}
            onClick$={() => select(i)}
          >
            {it && <Pixels rows={SPRITES[it.sprite]} size={32} class="hotbar__sprite" />}
          </button>
        ))}
      </div>

      <div class="hotbar__tooltip" aria-live="polite">
        {item ? (
          <>
            <p class="hotbar__tooltip-name">{item.name}</p>
            {item.lore.map((line) => (
              <p key={line} class="hotbar__tooltip-lore">
                {line}
              </p>
            ))}
          </>
        ) : (
          <p class="hotbar__tooltip-lore">（なにも持っていない）</p>
        )}
      </div>
    </div>
  );
});
