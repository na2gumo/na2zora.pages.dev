import { component$, Slot } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div class="site-container">
      <header class="site-header">
        <nav>
          <Link href="/" class="nav-brand">
            <strong>na2zora</strong>
          </Link>
          <Link href="/blog/">Blog</Link>
          <Link href="/feed.xml" target="_blank" rel="noopener noreferrer">RSS</Link>
        </nav>
      </header>

      <main>
        <Slot />
      </main>

      <footer class="site-footer">
        <p>© {new Date().getFullYear()} na2zora. Built with Qwik & Cloudflare Pages.</p>
      </footer>
    </div>
  );
});
