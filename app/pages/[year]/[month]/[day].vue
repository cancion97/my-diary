<script setup lang="ts">
const route = useRoute()
const year = Number(route.params.year)
const month = Number(route.params.month)
const day = Number(route.params.day)
const { apiBase } = useAuth()

// =====================================================================
// 投稿データ取得
// =====================================================================
type Comment = { id: number; name: string | null; body: string; createdAt: string }
type Entry = {
  id: number
  year: number
  month: number
  day: number
  imageUrl: string
  comment: string | null
  likeCount: number
  comments: Comment[]
}

const { data: entry, refresh } = await useFetch<Entry>(
  `${apiBase}/diaries/${year}/${month}/${day}`,
  { server: false }
)

// =====================================================================
// いいね
// =====================================================================
const likeCount = ref(entry.value?.likeCount ?? 0)
const likeLoading = ref(false)
const liked = ref(false)

const handleLike = async () => {
  if (likeLoading.value || !entry.value) return
  likeLoading.value = true
  try {
    const res = await $fetch<{ likeCount: number }>(
      `${apiBase}/diaries/${entry.value.id}/likes`,
      { method: 'POST' }
    )
    likeCount.value = res.likeCount
    liked.value = true
  } finally {
    likeLoading.value = false
  }
}

// =====================================================================
// コメント
// =====================================================================
const comments = ref<Comment[]>(entry.value?.comments ?? [])
const commentName = ref('')
const commentBody = ref('')
const commentLoading = ref(false)
const commentError = ref('')

const handleComment = async () => {
  if (!commentBody.value.trim()) {
    commentError.value = 'コメントを入力してください'
    return
  }
  commentError.value = ''
  commentLoading.value = true
  try {
    const res = await $fetch<Comment>(
      `${apiBase}/diaries/${entry.value!.id}/comments`,
      {
        method: 'POST',
        body: {
          name: commentName.value || null,
          body: commentBody.value,
        },
      }
    )
    comments.value.push(res)
    commentName.value = ''
    commentBody.value = ''
  } catch {
    commentError.value = '送信に失敗しました'
  } finally {
    commentLoading.value = false
  }
}

const commentPlaceholders = [
  '素敵すぎて眩暈がしました！',
  'Standing Ovation!!',
  '全米が泣いた',
  'よすぎ😂',
  'BIG LOVE...❤︎',
]
const commentPlaceholder = commentPlaceholders[Math.floor(Math.random() * commentPlaceholders.length)]
const monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
const monthName = monthNames[month - 1]

// 日付フォーマット
const formatDate = (str: string) => {
  const d = new Date(str)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<template>
  <main class="day-page">
    <div class="day-page__inner">

      <header class="day-page__header">
        <NuxtLink :to="`/${year}/${month}`" class="day-page__back">
          <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
            <path d="M7 1L1.5 6L7 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </NuxtLink>
        <div class="day-page__date">
          <span class="day-page__month">{{ monthName }}</span>
          <span class="day-page__day">{{ day }}</span>
          <span class="day-page__year">{{ year }}</span>
        </div>
      </header>

      <div v-if="!entry" class="day-page__empty">
        この日の投稿はありません
      </div>

      <template v-else>
        <!-- 写真 -->
        <figure class="day-page__figure">
          <NuxtImg :src="entry.imageUrl" :alt="`${month}/${day}`" class="day-page__img" />
        </figure>

        <!-- 一言 -->
        <p v-if="entry.comment" class="day-page__comment">{{ entry.comment }}</p>

        <!-- いいね -->
        <div class="day-page__like">
          <button
            class="day-page__like-btn"
            :class="{ 'is-liked': liked }"
            :disabled="likeLoading"
            @click="handleLike"
          >
            <svg width="22" height="22" viewBox="0 -960 960 960" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                v-if="liked"
                d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Z"
                fill="currentColor"
              />
              <path
                v-else
                d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z"
                fill="currentColor"
              />
            </svg>
            <span class="day-page__like-count">{{ likeCount }}</span>
          </button>
        </div>

        <!-- コメント一覧 -->
        <section class="day-page__comments">
          <h2 class="day-page__comments-heading">COMMENT</h2>

          <p v-if="comments.length === 0" class="day-page__no-comments">まだコメントはありません</p>

          <ul v-else class="day-page__comment-list">
            <li v-for="c in comments" :key="c.id" class="day-page__comment-item">
              <div class="day-page__comment-meta">
                <span class="day-page__comment-name">{{ c.name || '匿名' }}</span>
                <span class="day-page__comment-date">{{ formatDate(c.createdAt) }}</span>
              </div>
              <p class="day-page__comment-body">{{ c.body }}</p>
            </li>
          </ul>

          <!-- コメント投稿フォーム -->
          <form class="day-page__comment-form" @submit.prevent="handleComment">
            <div class="day-page__form-row">
              <label class="day-page__form-label">Name</label>
              <input
                v-model="commentName"
                type="text"
                class="day-page__input"
                placeholder="金田一　寅之助"
              />
            </div>
            <div class="day-page__form-row">
              <label class="day-page__form-label">Comment</label>
              <textarea
                v-model="commentBody"
                class="day-page__textarea"
                :placeholder="commentPlaceholder"
                rows="3"
              />
            </div>
            <p v-if="commentError" class="day-page__error">{{ commentError }}</p>
            <button type="submit" class="day-page__submit" :disabled="commentLoading">
              {{ commentLoading ? 'POST...' : 'POST' }}
            </button>
          </form>
        </section>
      </template>

    </div>
  </main>
</template>

<style lang="scss" scoped>
.day-page {
  min-height: 100vh;
  background-color: $color-bg;
}

.day-page__inner {
  max-width: 680px;
  margin: 0 auto;
  padding: 40px 20px 80px;
}

.day-page__header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
}

.day-page__back {
  color: $color-text;
  opacity: 0.5;
  text-decoration: none;
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 4px;
  transition: opacity 0.2s;
  &:hover { opacity: 1; }
}

.day-page__date {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.day-page__month {
  font-family: $font-bentham;
  font-size: getVw(18, 1440);
  color: $color-text;
  opacity: 0.5;
  @include mq {
    font-size: getVw(14);
  }
}

.day-page__day {
  font-family: $font-modak;
  font-size: getVw(48, 1440);
  color: $color-text;
  line-height: 1;
  @include mq {
    font-size: getVw(32);
  }
}

.day-page__year {
  font-family: $font-bentham;
  font-size: getVw(18, 1440);
  color: $color-text;
  opacity: 0.4;
  @include mq {
    font-size: getVw(14);
  }
}

.day-page__empty {
  font-family: $font-noto;
  font-size: 14px;
  color: $color-text;
  opacity: 0.5;
}

.day-page__figure {
  margin: 0 0 20px;
  border-radius: 8px;
  overflow: hidden;
}

.day-page__img {
  width: 100%;
  max-height: 480px;
  object-fit: cover;
  display: block;
}

.day-page__comment {
  font-family: $font-noto;
  font-size: 15px;
  color: $color-text;
  line-height: 1.8;
  margin: 0 0 24px;
}

.day-page__like {
  display: flex;
  margin-bottom: 40px;
}

.day-page__like-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  padding: 4px 0;
  font-family: $font-bentham;
  font-size: 15px;
  color: $color-text;
  cursor: pointer;
  transition: color 0.2s;
  line-height: 1;

  &:hover { opacity: 0.7; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }

  &.is-liked {
    color: #bf3d5b;
  }

  svg {
    display: block;
    flex-shrink: 0;
  }
}

.day-page__like-count {
  font-family: $font-noto;
  font-size: 14px;
}

.day-page__comments {
  border-top: 1px solid $color-border;
  padding-top: 32px;
}

.day-page__comments-heading {
  font-family: $font-crimson;
  font-size: 18px;
  letter-spacing: 0.08em;
  color: $color-text;
  margin: 0 0 20px;
}

.day-page__no-comments {
  font-family: $font-noto;
  font-size: 13px;
  color: $color-text;
  opacity: 0.4;
  margin: 0 0 24px;
}

.day-page__comment-list {
  list-style: none;
  padding: 0;
  margin: 0 0 32px;
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgba(0,0,0,0.12);
}

.day-page__comment-item {
  padding: 14px 0;
  background: transparent;
  border-bottom: 1px solid rgba(0,0,0,0.12);
}

.day-page__comment-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.day-page__comment-name {
  font-family: $font-noto;
  font-size: 13px;
  font-weight: 500;
  color: $color-text;
}

.day-page__comment-date {
  font-family: $font-noto;
  font-size: 11px;
  color: $color-text;
  opacity: 0.4;
}

.day-page__comment-body {
  font-family: $font-noto;
  font-size: 14px;
  color: $color-text;
  line-height: 1.7;
  margin: 0;
}

.day-page__comment-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.day-page__form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.day-page__form-label {
  font-family: $font-crimson;
  font-size: 15px;
  letter-spacing: 0.06em;
  color: $color-text;
  opacity: 0.6;
}

.day-page__input {
  padding: 10px 14px;
  border: 1px solid $color-border;
  border-radius: 8px;
  font-size: 14px;
  font-family: $font-noto;
  background: #fff;
  color: $color-text;
  outline: none;
  transition: border-color 0.2s;
  &:focus { border-color: $color-text; }
}

.day-page__textarea {
  padding: 10px 14px;
  border: 1px solid $color-border;
  border-radius: 8px;
  font-size: 14px;
  font-family: serif;
  font-style: italic;
  background: #fff;
  color: $color-text;
  outline: none;
  resize: vertical;
  transition: border-color 0.2s;
  &:focus { border-color: $color-text; }
}

.day-page__error {
  font-size: 12px;
  color: #c0392b;
  font-family: $font-noto;
  margin: 0;
}

.day-page__submit {
  align-self: flex-end;
  padding: 10px 24px;
  background: $color-text;
  color: $color-bg;
  border: none;
  border-radius: 32px;
  font-family: $font-crimson;
  font-size: 16px;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.8; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
</style>
