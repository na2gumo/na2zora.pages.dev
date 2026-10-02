import { component$, useSignal } from "@builder.io/qwik";
import type { GitHubActivityItem } from "../../lib/github";

interface ConstellationProps {
  items: GitHubActivityItem[];
}

/** id から -1〜1 の決まった揺らぎを作る */
const jitter = (id: string) => {
  let h = 2166136261;
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return ((h >>> 0) % 2001) / 1000 - 1;
};

const TYPE_LABEL: Record<string, string> = {
  PR: "プルリクエスト",
  Issue: "Issue",
  Create: "作成",
  Delete: "削除",
  Fork: "フォーク",
  Star: "スター",
  Release: "リリース",
  Comment: "コメント",
};

const STAR_COLOR: Record<string, string> = {
  Push: "#dbeafe",
  PR: "#c4b5fd",
  Issue: "#fde68a",
  Star: "#fef08a",
  Fork: "#a7f3d0",
  Create: "#bae6fd",
  Release: "#fbcfe8",
};

const label = (item: GitHubActivityItem) =>
  item.type === "Push" ? `${item.count ?? 1}件のコミット` : (TYPE_LABEL[item.type] ?? item.type);

const formatDate = (date: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  return m ? `${Number(m[2])}月${Number(m[3])}日` : date;
};

/**
 * 最近の GitHub の活動を星として並べ、古い順に線で結んだ星座。
 * 星を選ぶと、下のパネルにその日の内容が出る。
 */
export const Constellation = component$<ConstellationProps>(({ items }) => {
  const selected = useSignal(0);

  if (items.length === 0) {
    return (
      <p class="constellation__empty">
        今夜は雲が厚くて、星が見えません。
        <br />
        <a href="https://github.com/na2gumo" target="_blank" rel="noopener noreferrer">
          GitHub で直接見る ↗
        </a>
      </p>
    );
  }

  const n = items.length;
  // items は新しい順。左（上）が古く、右（下）が新しくなるように置く
  const points = items.map((item, idx) => {
    const i = n - 1 - idx;
    const k = n === 1 ? 0.5 : i / (n - 1);
    const j = jitter(item.id);
    const wave = Math.sin(i * 1.25 + 0.6);
    return {
      x: 7 + 86 * k,
      y: Math.min(88, Math.max(12, 50 + 28 * wave + 10 * j)),
      mx: Math.min(86, Math.max(14, 50 + 30 * wave + 8 * j)),
      my: 5 + 90 * (1 - k),
    };
  });
  const chrono = [...points].reverse();
  const desktopLine = chrono.map((p) => `${p.x},${p.y}`).join(" ");
  const mobileLine = chrono.map((p) => `${p.mx},${p.my}`).join(" ");

  const current = items[selected.value] ?? items[0];

  return (
    <div class="constellation">
      <div class="constellation__sky">
        <svg class="constellation__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline class="constellation__line constellation__line--wide" points={desktopLine} />
          <polyline class="constellation__line constellation__line--narrow" points={mobileLine} />
        </svg>
        {items.map((item, idx) => {
          const p = points[idx];
          const size = item.type === "Push" ? 14 + Math.min(item.count ?? 1, 10) * 2.2 : 14;
          return (
            <button
              key={item.id}
              type="button"
              class={["constellation__star", selected.value === idx && "is-selected"]}
              style={{
                "--x": `${p.x}%`,
                "--y": `${p.y}%`,
                "--mx": `${p.mx}%`,
                "--my": `${p.my}%`,
                "--size": `${size}px`,
                "--color": STAR_COLOR[item.type] ?? "#e2e8f0",
                "--delay": `${(idx * 0.73) % 3}s`,
              }}
              aria-pressed={selected.value === idx}
              aria-label={`${formatDate(item.date)} ${item.repoName} ${label(item)}`}
              onClick$={() => (selected.value = idx)}
            />
          );
        })}
      </div>

      <div class="constellation__panel" aria-live="polite">
        <p class="constellation__meta">
          <time dateTime={current.createdAt}>{formatDate(current.date)}</time>
          <span class="constellation__kind">{label(current)}</span>
        </p>
        <p class="constellation__repo">
          <a href={current.targetUrl || current.repoUrl} target="_blank" rel="noopener noreferrer">
            {current.repoName}
          </a>
        </p>
        {current.detailsList && current.detailsList.length > 0 ? (
          <ul class="constellation__commits">
            {current.detailsList.slice(0, 6).map((d, i) => (
              <li key={i}>
                {d.sha && <code class="constellation__sha">{d.sha}</code>}
                {d.url ? (
                  <a href={d.url} target="_blank" rel="noopener noreferrer">
                    {d.message}
                  </a>
                ) : (
                  <span>{d.message}</span>
                )}
              </li>
            ))}
            {current.detailsList.length > 6 && (
              <li class="constellation__more">ほか {current.detailsList.length - 6} 件</li>
            )}
          </ul>
        ) : current.detail ? (
          <p class="constellation__detail">{current.detail}</p>
        ) : null}
      </div>
    </div>
  );
});
