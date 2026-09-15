import { component$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <section class="home">
      <h1>na2zora</h1>
      <p style={{ fontSize: "1.1rem", color: "var(--color-text-muted)" }}>
        Web Developer / Personal Site & Blog
      </p>

      <div style={{ marginTop: "2rem" }}>
        <h2>About</h2>
        <p>
          Qwik City と Cloudflare Pages で構築した個人スペースです。<br />
          日々の学び、制作物、技術検証などを発信しています。
        </p>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h2>Recent Updates</h2>
        <ul>
          <li>
            <Link href="/blog/first-post/">
              最初のブログ記事：QwikとCloudflare Pagesで作る爆速サイト
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: "na2zora",
  meta: [
    {
      name: "description",
      content: "na2zora's personal website and blog",
    },
  ],
};
