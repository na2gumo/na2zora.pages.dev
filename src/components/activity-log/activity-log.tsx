import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { GitHubActivityItem, GitHubFeed } from "../../lib/github";
import { formatJstStamp, relativeTime, splitRepoName, truncate } from "../../lib/format";
import { SectionHead } from "../section-head/section-head";

const GITHUB_URL = "https://github.com/na2gumo";
const MAX_ROWS = 12;
const MAX_DETAILS = 8;
const DAYS = 14;
const COUNT_UP_MS = 900;

// 種別バッジの表示と色。表にない type は大文字の type を dim 枠で出す
const BADGES: Record<string, { label: string; tone: string }> = {
  Push: { label: "PUSH", tone: "lime" },
  PR: { label: "PR", tone: "cyan" },
  Issue: { label: "ISSUE", tone: "orange" },
  Create: { label: "CREATE", tone: "pink" },
  Release: { label: "RELEASE", tone: "lime-line" },
  Fork: { label: "FORK", tone: "cyan-line" },
  Star: { label: "STAR", tone: "orange-line" },
};

const badgeOf = (type: string) => BADGES[type] ?? { label: type.toUpperCase(), tone: "dim" };

/** 行の右側に出す要約。Push はコミット数、それ以外は detail を 40 字で切る */
const summaryOf = (item: GitHubActivityItem): string => {
  if (item.type === "Push") {
    const n = item.count ?? item.detailsList?.length ?? 1;
    return `${n} ${n === 1 ? "COMMIT" : "COMMITS"}`;
  }
  return item.detail ? truncate(item.detail.replace(/\s+/g, " "), 40) : "";
};

/** 14 日分に揃える（足りない分は古い側を 0 で埋める） */
const normalizeDays = (days: number[]): number[] => {
  const tail = days.slice(-DAYS);
  return [...Array.from({ length: DAYS - tail.length }, () => 0), ...tail];
};

/**
 * CH.03 ACTIVITY LOG ── GitHub の活動を HUD メーターとログ端末で見せる。
 */
export const ActivityLog = component$<{ feed: GitHubFeed }>(({ feed }) => {
  const { ok, items, pushesThisWeek, pushesByDay } = feed;
  const rows = items.slice(0, MAX_ROWS);
  const latest = ok ? items[0] : undefined;
  const hasRows = ok && rows.length > 0;

  const days = normalizeDays(ok ? pushesByDay : []);
  const maxDay = Math.max(1, ...days);

  // 相対時刻はサーバー描画時点の時刻が基準
  const lastRelative = latest ? relativeTime(latest.createdAt, Date.now()) : "--";
  const lastRepo = latest ? splitRepoName(latest.repoName).repo : "NO SIGNAL";

  // PUSHES / 7D のカウントアップ。JS が動かなければ最終値のまま表示される
  const target = ok ? pushesThisWeek : 0;
  const count = useSignal(target);
  const countRef = useSignal<HTMLElement>();

  useVisibleTask$(({ cleanup }) => {
    const el = countRef.value;
    if (!el || target <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // メーターが reveal される前に 0 へ戻しておく（セクションが見えた時点で実行される）
    count.value = 0;

    let raf = 0;
    let started = false;
    const run = () => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / COUNT_UP_MS);
        // easeOut（cubic）
        count.value = Math.round(target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    // Motion と同じ rootMargin で、reveal と同じタイミングに開始する
    const io = new IntersectionObserver(
      (entries) => {
        if (started || !entries.some((e) => e.isIntersecting)) return;
        started = true;
        io.disconnect();
        run();
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(el);

    cleanup(() => {
      io.disconnect();
      cancelAnimationFrame(raf);
    });
  });

  return (
    <section id="log" class="ch-section log" aria-labelledby="log-title">
      <SectionHead
        index="03"
        title="ACTIVITY LOG"
        sub="活動ログ"
        meta="SOURCE: api.github.com — CACHE 15MIN"
        id="log-title"
      />

      {/* 上段: HUD メーター 3 枚 */}
      <div class="meters">
        <div class="meter" data-reveal="up" style={{ "--i": 0 }}>
          <div class="meter__panel">
            <span class="mono-label">PUSHES / 7D</span>
            <span class="meter__big meter__big--lime" ref={countRef}>
              {ok ? count : "--"}
            </span>
            <span class="mono-label meter__foot">LAST 7 DAYS</span>
          </div>
        </div>

        <div class="meter" data-reveal="up" style={{ "--i": 1 }}>
          <div class="meter__panel">
            <span class="mono-label">14-DAY SIGNAL</span>
            <div
              class="chart"
              role="img"
              aria-label={
                ok ? `直近14日間のPush数（古い順）: ${days.join(", ")}` : "直近14日間のPush数は取得できませんでした"
              }
            >
              {days.map((n, i) => {
                const ago = DAYS - 1 - i;
                return (
                  <div
                    key={i}
                    class={{ bar: true, "bar--today": ago === 0, "bar--zero": n === 0 }}
                    style={{ "--h": (n / maxDay) * 100, "--b": i }}
                  >
                    <span class="bar__fill" />
                    <span class="bar__tip" aria-hidden="true">
                      {n} PUSH · {ago === 0 ? "TODAY" : `${ago}D AGO`}
                    </span>
                  </div>
                );
              })}
            </div>
            <div class="chart__axis mono-label" aria-hidden="true">
              <span>-13D</span>
              <span>TODAY</span>
            </div>
          </div>
        </div>

        <div class="meter" data-reveal="up" style={{ "--i": 2 }}>
          <div class="meter__panel">
            <span class="mono-label">LAST SIGNAL</span>
            <span class="meter__big meter__big--ink meter__big--sm">{lastRelative}</span>
            <span class="mono-label meter__foot meter__repo">{lastRepo}</span>
          </div>
        </div>
      </div>

      {/* 下段: ログ端末 */}
      <div class="term" data-reveal>
        <div class="term__panel">
          <div class="term__bar">
            <span class="term__dots" aria-hidden="true">
              <i class="term__dot term__dot--lime" />
              <i class="term__dot term__dot--orange" />
              <i class="term__dot term__dot--pink" />
            </span>
            <span class="term__title">~/na2gumo/activity.log</span>
            <span class="term__tail" aria-hidden="true">
              TAIL -F
            </span>
          </div>

          {hasRows ? (
            <div class="term__rows">
              {rows.map((item, i) => {
                const badge = badgeOf(item.type);
                const { repo, branch } = splitRepoName(item.repoName);
                const summary = summaryOf(item);
                const list = item.detailsList ?? [];
                const shown = list.slice(0, MAX_DETAILS);
                const more = list.length - shown.length;
                return (
                  <details key={item.id} class="row" data-reveal="up" style={{ "--i": i }}>
                    <summary class="row__summary">
                      <span class="row__time">[{formatJstStamp(item.createdAt)}]</span>
                      <span class="row__badge-cell">
                        <span class={["row__badge", `row__badge--${badge.tone}`]}>
                          <span>{badge.label}</span>
                        </span>
                      </span>
                      <span class="row__main">
                        <span class="row__repo">
                          {repo}
                          {branch && <span class="row__branch"> ({branch})</span>}
                        </span>
                        <span class="row__sum">{summary}</span>
                      </span>
                      <span class="row__caret" aria-hidden="true" />
                    </summary>

                    <div class="row__body">
                      <p class="row__action">&gt; {item.actionText} {repo}</p>
                      {shown.length > 0 ? (
                        <ul class="row__list">
                          {shown.map((d, n) => (
                            <li key={`${d.sha ?? d.message}-${n}`}>
                              {d.sha && <span class="row__sha">{d.sha}</span>}
                              {d.url ? (
                                <a href={d.url} target="_blank" rel="noopener noreferrer">
                                  {d.message}
                                </a>
                              ) : (
                                <span class="row__msg">{d.message}</span>
                              )}
                            </li>
                          ))}
                          {more > 0 && <li class="row__more">+{more} MORE</li>}
                        </ul>
                      ) : (
                        item.detail && <p class="row__detail">{item.detail}</p>
                      )}
                      {item.targetUrl && (
                        <a class="row__open" href={item.targetUrl} target="_blank" rel="noopener noreferrer">
                          OPEN ↗
                        </a>
                      )}
                    </div>
                  </details>
                );
              })}

              <p class="term__prompt">
                <span>na2gumo@na2zora:~$ </span>
                <span class="term__cursor" aria-hidden="true" />
              </p>
            </div>
          ) : (
            <p class="term__err" role="status">
              [ERR] SIGNAL LOST — GitHub に接続できませんでした。
            </p>
          )}

          <div class="term__foot">
            <a class="btn btn--ghost" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              FULL LOG ON GITHUB ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});
