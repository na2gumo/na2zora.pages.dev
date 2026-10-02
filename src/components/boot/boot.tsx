import { component$, useVisibleTask$ } from "@builder.io/qwik";

/** 起動済みフラグ（sessionStorage）のキー。router-head のインラインスクリプトと揃える */
const BOOT_FLAG = "na2zora:booted";

interface BootProps {
  /** GitHub の取得に成功したか */
  ok: boolean;
  /** 直近 7 日の Push 数 */
  pushes: number;
}

/**
 * 初回だけ出る全画面の起動画面。
 * 見た目の進行はすべて CSS アニメーション（JS が死んでも 2.6 秒で自分で閉じる）。
 * JS は「終わったことの記録」「SKIP」「REBOOT での再生」だけを担当する。
 */
export const Boot = component$<BootProps>(({ ok, pushes }) => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ cleanup }) => {
      const root = document.documentElement;
      let failsafe: number | undefined;

      const isActive = () => !root.classList.contains("boot-done");

      // 終了: フラグを立てて、ヒーローの reveal を許可する
      const finish = () => {
        window.clearTimeout(failsafe);
        try {
          sessionStorage.setItem(BOOT_FLAG, "1");
        } catch {
          // sessionStorage が使えなくても進行には影響しない
        }
        root.classList.add("booted", "boot-done");
      };

      // CSS の長さ（2.6s）より少し余裕をもたせた保険
      const armFailsafe = () => {
        window.clearTimeout(failsafe);
        failsafe = window.setTimeout(() => {
          if (isActive()) finish();
        }, 3200);
      };

      const skip = () => {
        if (!isActive()) return;
        document.querySelector(".boot")?.classList.add("boot--skip");
        // .boot--skip のフェードが終わる前にも次へ進めるよう、短い保険を張る
        window.clearTimeout(failsafe);
        failsafe = window.setTimeout(finish, 260);
      };

      // 最後のアニメーション（boot-out / boot-skip）が終わったら終了
      const onAnimationEnd = (e: AnimationEvent) => {
        const target = e.target as HTMLElement;
        if (!target.classList?.contains("boot")) return;
        if (e.animationName === "boot-out" || e.animationName === "boot-skip") finish();
      };

      const onClick = (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest?.(".boot__skip")) skip();
      };

      const onKey = (e: KeyboardEvent) => {
        if (!isActive()) return;
        if (e.key === "Escape" || e.key === "Enter") skip();
      };

      // フッターの REBOOT: フラグを消して、要素ごと入れ替えて CSS アニメーションを最初から再生する
      const onReboot = () => {
        try {
          sessionStorage.removeItem(BOOT_FLAG);
        } catch {
          // 無視
        }
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const boot = document.querySelector(".boot");
        if (boot) {
          const clone = boot.cloneNode(true) as HTMLElement;
          clone.classList.remove("boot--skip");
          boot.replaceWith(clone);
        }
        root.classList.remove("booted", "boot-done");
        armFailsafe();
      };

      document.addEventListener("animationend", onAnimationEnd, true);
      document.addEventListener("click", onClick);
      document.addEventListener("keydown", onKey);
      window.addEventListener("na2zora:reboot", onReboot);

      // 初回表示中ならここで保険を張る
      if (isActive()) armFailsafe();

      cleanup(() => {
        window.clearTimeout(failsafe);
        document.removeEventListener("animationend", onAnimationEnd, true);
        document.removeEventListener("click", onClick);
        document.removeEventListener("keydown", onKey);
        window.removeEventListener("na2zora:reboot", onReboot);
      });
    },
    { strategy: "document-ready" },
  );

  return (
    <div class="boot" aria-hidden="true">
      <div class="boot__body">
        <p class="boot__title">NA2ZORA TERMINAL v2.6</p>
        <p class="boot__line" style={{ "--n": 0 }}>
          <span>&gt; mounting /dev/agent</span>
          <span class="boot__dots">{".".repeat(80)}</span>
          <span class="boot__ok">[ OK ]</span>
        </p>
        <p class="boot__line" style={{ "--n": 1 }}>
          <span>&gt; linking github.com/na2gumo</span>
          <span class="boot__dots">{".".repeat(80)}</span>
          <span class="boot__ok">[ OK ]</span>
        </p>
        <p class="boot__line" style={{ "--n": 2 }}>
          <span>&gt; syncing activity feed</span>
          <span class="boot__dots">{".".repeat(80)}</span>
          {ok ? (
            <>
              <span class="boot__ok">[ OK ]</span>
              <span class="boot__extra">{pushes} PUSHES / 7D</span>
            </>
          ) : (
            <span class="boot__ng">[ OFFLINE ]</span>
          )}
        </p>
        <p class="boot__line" style={{ "--n": 3 }}>
          <span>&gt; operator authenticated</span>
          <span class="caret" />
        </p>
        <div class="boot__bar">
          <span class="boot__bar-fill" />
        </div>
      </div>

      {/* ワイプ: ライムのパネルが右下から左上へ走り抜ける */}
      <div class="boot__wipe">
        <span>NA2ZORA</span>
      </div>

      <button type="button" class="boot__skip">
        SKIP ›
      </button>
    </div>
  );
});
