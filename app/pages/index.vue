<script setup lang="ts">
const MIN_YEAR = 2025
const MAX_YEAR = 2026

const year = ref(new Date().getFullYear())
const prevYear = () => year.value--
const nextYear = () => year.value++

const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
const items = computed(() =>
  months.map((name, i) => ({ id: i + 1, name, year: year.value }))
)
</script>

<template>
  <main class="main">
    <div class="bg"></div>
    <div class="container">
      <h1 class="heading">
        <NuxtImg src="/images/365.svg" alt="365" class="logo"/>
      </h1>
      <div class="year-nav">
        <button :style="{ visibility: year > MIN_YEAR ? 'visible' : 'hidden' }" @click="prevYear">
          <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 1L1.5 6L7 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span>{{ year }}</span>
        <button :style="{ visibility: year < MAX_YEAR ? 'visible' : 'hidden' }" @click="nextYear">
          <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L6.5 6L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="grid-wrapper">
        <ol>
          <li v-for="item in items" :key="item.id">
            <NuxtLink :to="`/${item.year}/${item.id}`">
              <span class="num">{{ item.id }}</span>
              <span class="month">{{ item.name }}</span>
            </NuxtLink>
          </li>
        </ol>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.main {
  background-color: $color-bg;
  min-height: 100vh;
  padding-block: 56px;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.heading {
  margin: 0 auto;
  width: getVw(190, 1200);
  padding-bottom: 32px;
  .logo { width: 100%; }
  @include mq { width: getVw(114); }
}

.year-nav {
  display: flex;
  color: $color-text;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
  font-family: $font-bentham;
  font-size: getVw(24, 1440);

  button {
    background: none;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    cursor: pointer;
    color: $color-text;
    padding: 7px 10px;
    border-radius: 4px;
    transition: 0.3s;
    &:hover { background-color: #fbf9f9fb; }
  }

  @include mq() {
    font-size: getVw(16);
    button { font-size: getVw(10); }
  }
}

.grid-wrapper ol {
  color: $color-text;
  margin: 0 auto;
  list-style: none;
  width: fit-content;
  display: grid;
  background-color: $color-text;
  gap: 0.5px;
  grid-template-columns: repeat(4, 1fr);
  @include mq() { grid-template-columns: repeat(3, 1fr); gap: 0.5px;}
}

.grid-wrapper li {
  width: getVw(200, 1440);
  height: getVw(140, 1440);

  a {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
    height: 100%;
    background-color: $color-bg;
    text-decoration: none;
    color: $color-text;
    transition: 0.3s;
    &:hover { background-color: #fbf9f9fb; }
  }

  @include mq() {
    width: getVw(100);
    height: getVw(70.2);
  }

  .num {
    font-family: $font-modak;
    font-size: getVw(48, 1400);
    line-height: 1;
    @include mq() { font-size: getVw(24); }
  }

  .month {
    position: absolute;
    bottom: 8px;
    right: 12px;
    font-family: $font-bentham;
    font-size: getVw(20, 1400);
    @include mq() {
      font-size: getVw(12);
      bottom: 4px;
      right: 6px;
    }
  }
}
</style>
