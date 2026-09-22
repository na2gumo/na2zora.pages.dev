import { component$, useVisibleTask$, useSignal, $ } from "@builder.io/qwik";

export type Theme = "auto" | "light" | "dark";

export const ThemeToggle = component$(() => {
  const currentTheme = useSignal<Theme>("auto");

  useVisibleTask$(() => {
    const savedTheme = (localStorage.getItem("theme") as Theme) || "auto";
    currentTheme.value = savedTheme;

    // システムのカラースキーム変更を監視（auto選択時）
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (currentTheme.value === "auto") {
        document.documentElement.setAttribute("data-theme", mediaQuery.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  });

  const setTheme = $((theme: Theme) => {
    currentTheme.value = theme;
    if (theme === "auto") {
      localStorage.removeItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
      localStorage.setItem("theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
  });

  return (
    <div class="theme-toggle-group" role="group" aria-label="テーマ切り替え">
      {/* 1. 自動検出 (Desktop/Monitor) */}
      <button
        type="button"
        class={["theme-btn", currentTheme.value === "auto" ? "active" : ""]}
        onClick$={() => setTheme("auto")}
        title="システムのテーマに自動追従"
        aria-label="自動テーマ"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <line x1="8" x2="16" y1="21" y2="21" />
          <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
      </button>

      {/* 2. ライトモード (Sun) */}
      <button
        type="button"
        class={["theme-btn", currentTheme.value === "light" ? "active" : ""]}
        onClick$={() => setTheme("light")}
        title="ライトモードに固定"
        aria-label="ライトモード"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      </button>

      {/* 3. ダークモード (Moon) */}
      <button
        type="button"
        class={["theme-btn", currentTheme.value === "dark" ? "active" : ""]}
        onClick$={() => setTheme("dark")}
        title="ダークモードに固定"
        aria-label="ダークモード"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </button>
    </div>
  );
});
