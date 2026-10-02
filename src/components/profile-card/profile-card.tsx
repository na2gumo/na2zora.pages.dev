import { component$ } from "@builder.io/qwik";

/**
 * VRChat のプロフィール画面ふうの自己紹介カード。
 */
export const ProfileCard = component$(() => {
  return (
    <article class="profile-card" aria-labelledby="profile-name">
      <div class="profile-card__banner" aria-hidden="true">
        <span class="profile-card__banner-label">na2zora</span>
      </div>

      <div class="profile-card__head">
        <picture class="profile-card__avatar">
          <source srcset="/avatar.avif" type="image/avif" />
          <img
            src="https://avatars.githubusercontent.com/u/266047745?v=4"
            alt=""
            width="96"
            height="96"
            loading="lazy"
          />
        </picture>
        <div class="profile-card__ident">
          <h3 id="profile-name" class="profile-card__name">
            なつぐも
          </h3>
          <p class="profile-card__status">
            <span class="profile-card__dot" aria-hidden="true" />
            <span class="profile-card__status-label">Online</span>
            <span class="profile-card__status-desc">夏空を見上げてる</span>
          </p>
        </div>
      </div>

      <dl class="profile-card__fields">
        <div class="profile-card__field profile-card__field--bio">
          <dt>Bio</dt>
          <dd>
            VRChatに生息している学生です。
            <br />
            最近はMinecraftにも手を付けたり。
          </dd>
        </div>
        <div class="profile-card__field">
          <dt>Handle</dt>
          <dd class="profile-card__mono">@na2gumo</dd>
        </div>
        <div class="profile-card__field">
          <dt>Language</dt>
          <dd>
            <span class="profile-card__chip">日本語</span>
          </dd>
        </div>
        <div class="profile-card__field">
          <dt>Links</dt>
          <dd>
            <a class="profile-card__chip profile-card__chip--link" href="https://github.com/na2gumo" target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
          </dd>
        </div>
      </dl>
    </article>
  );
});
