import { component$ } from "@builder.io/qwik";

interface SectionHeadProps {
  /** チャンネル番号（"01" など） */
  index: string;
  /** 英字タイトル（"AGENT FILE" など） */
  title: string;
  /** 和文サブタイトル */
  sub: string;
  /** 右上に出す mono ラベル。既定は `CH.{index} / 03` */
  meta?: string;
  /** h2 の id（セクションの aria-labelledby から参照する） */
  id: string;
}

/**
 * セクション見出し。巨大な白抜き番号の下半分にタイトルが重なる。
 * 番号・タイトル・サブ・下線はそれぞれ data-reveal で時差をつけて出す。
 */
export const SectionHead = component$<SectionHeadProps>(({ index, title, sub, meta, id }) => {
  return (
    <header class="section-head">
      <div class="section-head__top">
        <span class="section-head__num" data-reveal style={{ "--i": 0 }} aria-hidden="true">
          {index}
        </span>
        <span class="section-head__meta mono-label">{meta ?? `CH.${index} / 03`}</span>
      </div>
      <h2 id={id} class="section-head__title" data-reveal style={{ "--i": 1 }}>
        {title}
      </h2>
      <p class="section-head__sub" data-reveal style={{ "--i": 2 }}>
        <span class="section-head__slash" aria-hidden="true">
          ／
        </span>
        {sub}
      </p>
      <div class="section-head__rule" data-reveal="line" style={{ "--i": 3 }} aria-hidden="true" />
    </header>
  );
});
