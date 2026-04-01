<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()
const year = Number(route.params.year)
const month = Number(route.params.month)

// その月の投稿データを取得
const { data: entries } = await useFetch(`http://localhost:5159/diaries/${year}/${month}`, {
  server: false,
  default: () => [],
})

// 投稿をdayをキーにしたMapに変換
const entryMap = computed(() => {
  const map = new Map<number, any>()
  for (const entry of (entries.value as any[])) {
    map.set(entry.day, entry)
  }
  return map
})

// その月の日数
const daysInMonth = computed(() => new Date(year, month, 0).getDate())

// 1日の曜日（0=日, 1=月, ..., 6=土）
const firstDayOfWeek = computed(() => new Date(year, month - 1, 1).getDay())

// 日付の配列
const days = computed(() =>
  Array.from({ length: daysInMonth.value }, (_, i) => i + 1)
)

// 月名
const monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
const monthName = monthNames[month - 1]
</script>

<template>
  <main class="main">
    <div class="container">
      <header class="page-header">
        <NuxtLink :to="`/`" class="back">&#8592;</NuxtLink>
        <h1 class="title">
          <span class="month-name">{{ monthName }}</span>
          <span class="year-label">{{ year }}</span>
        </h1>
      </header>

      <div class="calendar">
        <NuxtLink
          v-for="day in days"
          :key="day"
          :to="`/${year}/${month}/${day}`"
          class="day-cell"
          :class="{ 'has-photo': entryMap.has(day) }"
          :style="day === 1 ? { gridColumnStart: firstDayOfWeek + 1 } : {}"
        >
          <NuxtImg
            v-if="entryMap.has(day)"
            :src="entryMap.get(day).imageUrl"
            :alt="`${month}/${day}`"
            class="thumb"
          />
          <span class="day-num">{{ day }}</span>
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.main {
  background-color: $color-bg;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 40px;

  .back {
    font-size: 1.5rem;
    color: $color-text;
    text-decoration: none;
    opacity: 0.5;
    transition: opacity 0.2s;
    &:hover { opacity: 1; }
  }

  .title {
    display: flex;
    align-items: baseline;
    gap: 12px;
  }

  .month-name {
    font-family: $font-modak;
    font-size: getVw(64, 1440);
    line-height: 1;
    @include mq() { font-size: getVw(40); }
  }

  .year-label {
    font-family: $font-bentham;
    font-size: getVw(20, 1440);
    opacity: 0.5;
    @include mq() { font-size: getVw(14); }
  }
}

.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5px;
  background-color: $color-border;

  @include mq() {
    grid-template-columns: repeat(4, 1fr);
  }
}

.day-cell {
  position: relative;
  aspect-ratio: 1;
  background-color: $color-bg;
  text-decoration: none;
  color: $color-text;
  overflow: hidden;
  transition: opacity 0.2s;

  &:hover { opacity: 0.8; }

  &.has-photo .day-num {
    // 写真がある日は日付を左上に小さく
    font-size: getVw(12, 1440);
    top: 8px;
    left: 8px;
    bottom: auto;
    right: auto;
    @include mq() { font-size: getVw(10); }
  }

  .thumb {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .day-num {
    position: absolute;
    bottom: 8px;
    right: 8px;
    font-family: $font-bentham;
    font-size: getVw(16, 1440);
    line-height: 1;
    z-index: 1;
    @include mq() { font-size: getVw(12); }
  }
}
</style>
