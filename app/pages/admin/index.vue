<script setup lang="ts">
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

definePageMeta({ layout: false })

const { isLoggedIn, logout, token, apiBase } = useAuth()

if (!isLoggedIn.value) {
  navigateTo('/login')
}

// =====================================================================
// 投稿フォーム
// =====================================================================
const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth() + 1)
const day = ref(today.getDate())
const comment = ref('')
const loading = ref(false)
const success = ref('')
const error = ref('')

// トリミング関連
const rawImageSrc = ref('')
const cropperRef = ref()
const showCropper = ref(false)
const selectedRatio = ref<number | undefined>(1)

const ratioOptions = [
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
  { label: '16:9', value: 16 / 9 },
  { label: 'フリー', value: undefined },
]

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    rawImageSrc.value = ev.target?.result as string
    showCropper.value = true
  }
  reader.readAsDataURL(file)
}

const croppedPreviewUrl = ref('')

const applyCrop = () => {
  if (!cropperRef.value) {
    console.error('cropperRef is null')
    return
  }
  const { canvas } = cropperRef.value.getResult()
  if (!canvas) {
    console.error('canvas is null')
    return
  }
  croppedPreviewUrl.value = canvas.toDataURL('image/jpeg', 0.92)
  showCropper.value = false
}

const cancelCrop = () => {
  showCropper.value = false
  rawImageSrc.value = ''
  croppedPreviewUrl.value = ''
}

const handleSubmit = async () => {
  if (!croppedPreviewUrl.value) {
    error.value = '画像をトリミングしてください'
    return
  }
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    console.log('croppedPreviewUrl length:', croppedPreviewUrl.value.length)
    console.log('croppedPreviewUrl prefix:', croppedPreviewUrl.value.substring(0, 50))
    // dataURLをBlobに変換
    const res = await fetch(croppedPreviewUrl.value)
    const blob = await res.blob()
    console.log('blob type:', blob.type, 'size:', blob.size)
    const formData = new FormData()
    formData.append('file', blob, 'image.jpg')

    const { url } = await $fetch<{ url: string }>(`${apiBase}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: formData,
    })

    await $fetch(`${apiBase}/diaries`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        year: year.value,
        month: month.value,
        day: day.value,
        imageUrl: url,
        comment: comment.value || null,
      },
    })

    success.value = '投稿しました！'
    croppedPreviewUrl.value = ''
    rawImageSrc.value = ''
    comment.value = ''
    await fetchEntries()
  } catch (e: any) {
    error.value = e?.data ?? '投稿に失敗しました'
  } finally {
    loading.value = false
  }
}

// =====================================================================
// 投稿一覧・削除
// =====================================================================
type Entry = {
  id: number
  year: number
  month: number
  day: number
  imageUrl: string
  comment: string | null
}

const listYear = ref(today.getFullYear())
const listMonth = ref(today.getMonth() + 1)
const entries = ref<Entry[]>([])
const listLoading = ref(false)
const deleteError = ref('')

const fetchEntries = async () => {
  listLoading.value = true
  try {
    entries.value = await $fetch<Entry[]>(
      `${apiBase}/diaries/${listYear.value}/${listMonth.value}`
    )
  } finally {
    listLoading.value = false
  }
}

const handleDelete = async (entry: Entry) => {
  if (!confirm(`${entry.year}/${entry.month}/${entry.day} の投稿を削除しますか？`)) return
  deleteError.value = ''
  try {
    await $fetch(`${apiBase}/diaries/${entry.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` },
    })
    await fetchEntries()
  } catch {
    deleteError.value = '削除に失敗しました'
  }
}

onMounted(() => fetchEntries())
watch([listYear, listMonth], () => fetchEntries())

const handleLogout = () => {
  logout()
  navigateTo('/login')
}
</script>

<template>
  <main class="admin">
    <header class="admin__header">
      <NuxtImg src="/images/365.svg" alt="365" class="admin__logo" />
      <button class="admin__logout" @click="handleLogout">ログアウト</button>
    </header>

    <div class="admin__body">

      <!-- トリミングモーダル -->
      <div v-if="showCropper" class="admin__cropper-overlay">
        <div class="admin__cropper-box">
          <div class="admin__cropper-ratios">
            <button
              v-for="opt in ratioOptions"
              :key="opt.label"
              class="admin__ratio-btn"
              :class="{ 'is-active': selectedRatio === opt.value }"
              @click="selectedRatio = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
          <Cropper
            ref="cropperRef"
            :src="rawImageSrc"
            :stencil-props="{ aspectRatio: selectedRatio }"
            class="admin__cropper"
          />
          <div class="admin__cropper-actions">
            <button class="admin__cropper-cancel" @click="cancelCrop">キャンセル</button>
            <button class="admin__cropper-apply" @click="applyCrop">決定</button>
          </div>
        </div>
      </div>

      <!-- 投稿フォーム -->
      <section class="admin__section">
        <h2 class="admin__heading">新しい投稿</h2>
        <form class="admin__form" @submit.prevent="handleSubmit">
          <div class="admin__row">
            <label class="admin__label">日付</label>
            <div class="admin__date">
              <input v-model="year" type="number" class="admin__input admin__input--sm" />
              <span>/</span>
              <input v-model="month" type="number" min="1" max="12" class="admin__input admin__input--sm" />
              <span>/</span>
              <input v-model="day" type="number" min="1" max="31" class="admin__input admin__input--sm" />
            </div>
          </div>

          <div class="admin__row">
            <label class="admin__label">写真 <span class="admin__required">必須</span></label>
            <label class="admin__file-label">
              <input type="file" accept="image/*" class="admin__file-input" @change="onFileChange" />
              <span class="admin__file-btn">ファイルを選択してトリミング</span>
            </label>
            <div v-if="croppedPreviewUrl" class="admin__preview-wrap">
              <img :src="croppedPreviewUrl" alt="preview" class="admin__preview-img" />
              <button type="button" class="admin__reselect" @click="showCropper = true">再トリミング</button>
            </div>
          </div>

          <div class="admin__row">
            <label class="admin__label">一言 <span class="admin__optional">任意</span></label>
            <textarea v-model="comment" class="admin__textarea" placeholder="今日の一言..." rows="3" />
          </div>

          <p v-if="error" class="admin__error">{{ error }}</p>
          <p v-if="success" class="admin__success">{{ success }}</p>

          <button type="submit" class="admin__btn" :disabled="loading">
            {{ loading ? '投稿中...' : '投稿する' }}
          </button>
        </form>
      </section>

      <!-- 投稿一覧・削除 -->
      <section class="admin__section">
        <h2 class="admin__heading">投稿の管理</h2>
        <div class="admin__list-nav">
          <input v-model="listYear" type="number" class="admin__input admin__input--sm" />
          <span>/</span>
          <input v-model="listMonth" type="number" min="1" max="12" class="admin__input admin__input--sm" />
        </div>

        <p v-if="deleteError" class="admin__error">{{ deleteError }}</p>
        <p v-if="listLoading" class="admin__empty">読み込み中...</p>
        <p v-else-if="entries.length === 0" class="admin__empty">この月の投稿はありません</p>

        <ul v-else class="admin__list">
          <li v-for="entry in entries" :key="entry.id" class="admin__list-item">
            <img :src="entry.imageUrl" :alt="`${entry.month}/${entry.day}`" class="admin__list-thumb" />
            <div class="admin__list-info">
              <span class="admin__list-date">{{ entry.year }}/{{ entry.month }}/{{ entry.day }}</span>
              <span v-if="entry.comment" class="admin__list-comment">{{ entry.comment }}</span>
            </div>
            <button class="admin__delete-btn" @click="handleDelete(entry)">削除</button>
          </li>
        </ul>
      </section>

      <div class="admin__footer">
        <NuxtLink to="/" class="admin__link">← カレンダーを見る</NuxtLink>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.admin {
  min-height: 100vh;
  background-color: $color-bg;
}

.admin__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 40px;
  border-bottom: 1px solid $color-border;
}

.admin__logo { width: 80px; }

.admin__logout {
  background: none;
  border: 1px solid $color-border;
  border-radius: 4px;
  padding: 6px 14px;
  font-family: $font-noto;
  font-size: 12px;
  color: $color-text;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.6; }
}

.admin__body {
  max-width: 560px;
  margin: 0 auto;
  padding: 48px 20px;
  font-family: $font-noto;
}

.admin__section { margin-bottom: 56px; }

.admin__heading {
  font-family: $font-noto;
  font-size: 18px;
  color: $color-text;
  margin: 0 0 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid $color-border;
}

.admin__form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.admin__row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.admin__label {
  font-family: $font-noto;
  font-size: 13px;
  color: $color-text;
  display: flex;
  align-items: center;
  gap: 6px;
}

.admin__required { font-size: 10px; color: #c0392b; }
.admin__optional { font-size: 10px; color: #888; }

.admin__date,
.admin__list-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: $font-noto;
  color: $color-text;
  margin-bottom: 16px;
}

.admin__input {
  padding: 10px 14px;
  border: 1px solid $color-border;
  border-radius: 4px;
  font-size: 14px;
  font-family: $font-noto;
  background: #fff;
  color: $color-text;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
  &:focus { border-color: $color-text; }
  &--sm { width: 72px; }
}

.admin__file-label { cursor: pointer; }
.admin__file-input { display: none; }

.admin__file-btn {
  display: inline-block;
  padding: 10px 16px;
  border: 1px dashed $color-border;
  border-radius: 4px;
  font-family: $font-noto;
  font-size: 13px;
  color: $color-text;
  background: #fff;
  transition: border-color 0.2s;
  &:hover { border-color: $color-text; }
}

.admin__preview-wrap {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin__preview-img {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 4px;
  background: #eee;
}

.admin__reselect {
  align-self: flex-start;
  background: none;
  border: 1px solid $color-border;
  border-radius: 4px;
  padding: 5px 12px;
  font-family: $font-noto;
  font-size: 12px;
  color: $color-text;
  cursor: pointer;
  &:hover { opacity: 0.6; }
}

.admin__textarea {
  padding: 10px 14px;
  border: 1px solid $color-border;
  border-radius: 4px;
  font-size: 14px;
  font-family: $font-noto;
  background: #fff;
  color: $color-text;
  outline: none;
  resize: vertical;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
  &:focus { border-color: $color-text; }
}

.admin__error { font-size: 12px; color: #c0392b; margin: 0; }
.admin__success { font-size: 12px; color: #27ae60; margin: 0; }
.admin__empty { font-size: 13px; color: #888; }

.admin__btn {
  padding: 12px;
  background: $color-text;
  color: $color-bg;
  border: none;
  border-radius: 4px;
  font-family: $font-noto;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.8; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.admin__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin__list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #fff;
  border: 1px solid $color-border;
  border-radius: 6px;
}

.admin__list-thumb {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.admin__list-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.admin__list-date {
  font-size: 13px;
  font-family: $font-noto;
  color: $color-text;
  font-weight: 500;
}

.admin__list-comment {
  font-size: 12px;
  font-family: $font-noto;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin__delete-btn {
  background: none;
  border: 1px solid #e0b0b0;
  border-radius: 4px;
  padding: 5px 10px;
  font-family: $font-noto;
  font-size: 12px;
  color: #c0392b;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
  &:hover { background: #fdf0f0; }
}

.admin__footer { margin-top: 16px; }

.admin__link {
  font-family: $font-noto;
  font-size: 13px;
  color: $color-text;
  opacity: 0.5;
  text-decoration: none;
  &:hover { opacity: 1; }
}

// =====================================================================
// トリミングモーダル
// =====================================================================
.admin__cropper-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.admin__cropper-box {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 20px;
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.admin__cropper-ratios {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.admin__ratio-btn {
  padding: 5px 14px;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 4px;
  background: none;
  color: rgba(255,255,255,0.6);
  font-family: $font-noto;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { border-color: #fff; color: #fff; }
  &.is-active { border-color: #fff; color: #fff; background: rgba(255,255,255,0.1); }
}

.admin__cropper {
  max-height: 400px;
  border-radius: 4px;
  overflow: hidden;
}

.admin__cropper-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.admin__cropper-cancel {
  padding: 8px 20px;
  background: none;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 4px;
  color: rgba(255,255,255,0.6);
  font-family: $font-noto;
  font-size: 13px;
  cursor: pointer;
  &:hover { opacity: 0.8; }
}

.admin__cropper-apply {
  padding: 8px 20px;
  background: #fff;
  border: none;
  border-radius: 4px;
  color: #1a1a1a;
  font-family: $font-noto;
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
  &:hover { opacity: 0.9; }
}
</style>
