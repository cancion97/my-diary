<script setup lang="ts">
import { computed, onMounted, ref, resolveComponent } from 'vue'

const route = useRoute()
const year = Number(route.params.year)
const month = Number(route.params.month)
const { apiBase } = useAuth()

// その月の投稿データを取得
const { data: entries } = await useFetch(`${apiBase}/diaries/${year}/${month}`, {
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

const NuxtLinkComponent = resolveComponent('NuxtLink')

// 月名
const monthNamesShort = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
const monthNamesFull = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER']
const monthName = monthNamesFull[month - 1]
const monthNum = String(month)

// 雨アニメーション（6月のみ）
type RainDrop = { style: string; stemStyle: string }
const rainDropsFront = ref<RainDrop[]>([])
const rainDropsBack = ref<RainDrop[]>([])

if (month === 6) {
  onMounted(() => {
    const front: RainDrop[] = []
    const back: RainDrop[] = []
    let increment = 0
    while (increment < 100) {
      const randoHundo = Math.floor(Math.random() * 98 + 1)
      const randoFiver = Math.floor(Math.random() * 4 + 2)
      increment += randoFiver
      const animStyle = `animation-delay: 0.${randoHundo}s; animation-duration: 0.5${randoHundo}s;`
      front.push({
        style: `left: ${increment}%; bottom: ${randoFiver * 2 - 1 + 100}%; ${animStyle}`,
        stemStyle: animStyle,
      })
      back.push({
        style: `right: ${increment}%; bottom: ${randoFiver * 2 - 1 + 100}%; ${animStyle}`,
        stemStyle: animStyle,
      })
    }
    rainDropsFront.value = front
    rainDropsBack.value = back
  })
}


</script>

<template>
  <main class="main" :class="`month-${month}`">
    <div class="container">
      <header class="page-header">
        <NuxtLink :to="`/`" class="back">
          <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 1L1.5 6L7 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="backtxt">BACK</span>
        </NuxtLink>
        <div class="title-block">
          <span class="year-label">{{ year }}</span>
          <div class="month-wrap">
            <span class="month-num-bg">{{ monthNum }}</span>
            <span class="month-name">{{ monthName }}</span>
          </div>
        </div>
      </header>

      <template v-if="month === 6">
        <div class="rain rain--front">
          <div v-for="(drop, i) in rainDropsFront" :key="i" class="rain__drop" :style="drop.style">
            <div class="rain__stem" :style="drop.stemStyle"></div>
            <div class="rain__splat" :style="drop.stemStyle"></div>
          </div>
        </div>
        <div class="rain rain--back">
          <div v-for="(drop, i) in rainDropsBack" :key="i" class="rain__drop" :style="drop.style">
            <div class="rain__stem" :style="drop.stemStyle"></div>
            <div class="rain__splat" :style="drop.stemStyle"></div>
          </div>
        </div>
      </template>

      <div v-if="month === 1" class="snow">
        <div v-for="i in 80" :key="i" class="flake" />
      </div>

      <div v-if="month === 4" class="sakura">
        <div v-for="i in 24" :key="i" class="sakura__petal" />
      </div>

      <div class="weekdays">
        <span v-for="wd in ['SUN','MON','TUE','WED','THU','FRI','SAT']" :key="wd" class="wd">{{ wd }}</span>
      </div>

      <div class="calendar">
        <component
          :is="entryMap.has(day) ? NuxtLinkComponent : 'div'"
          v-for="day in days"
          :key="day"
          :to="entryMap.has(day) ? `/${year}/${month}/${day}` : undefined"
          class="day-cell"
          :class="{ 'has-photo': entryMap.has(day) }"
          :style="day === 1 ? { gridColumnStart: firstDayOfWeek + 1 } : {}"
        >
          <div class="circle">
            <NuxtImg
              v-if="entryMap.has(day)"
              :src="entryMap.get(day).imageUrl"
              :alt="`${month}/${day}`"
              class="thumb"
            />
          </div>
          <span class="day-num">{{ day }}</span>
        </component>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.main {
  min-height: 100vh;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 40px;

  .back {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    opacity: 0.7;
    padding: 7px 10px;
    border-radius: 4px;
    transition: opacity 0.3s, background-color 0.3s;
    &:hover {
      opacity: 1;
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
  .backtxt{
    font-size: 12px;
    margin-left: 10px;
    text-decoration: none;
  }

  .title-block {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0;

    .year-label {
      margin-bottom: -8px;
    }
  }

  .year-label {
    line-height: 1;
    margin-bottom: 2px;
  }

  .month-wrap {
    display: grid;
  }

  .month-num-bg,
  .month-name {
    grid-area: 1 / 1;
    place-self: center;
  }

  .month-num-bg {
    line-height: 1;
    opacity: 1;
    mix-blend-mode: overlay;
    pointer-events: none;
    user-select: none;
    padding-bottom: 20px;
  }

  .month-name {
    z-index: 2;
    line-height: 1;
  }
}

.weekdays {
  display: flex;
  gap: 40px;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  @include mq() {
    gap: 10px;
  }

  .wd {
    text-align: center;
    width: 50px;
    font-size: 12px;
    letter-spacing: 0.1em;
    @include mq() {
      width: 35px;
    }
  }
}

.calendar {
  display: grid;
  grid-template-columns: repeat(7, max-content);
  gap: 25px 40px;
  justify-content: center;
  margin-bottom: 60px;

  @include mq() {
    gap: 10px;
  }
}

.day-cell {
  text-decoration: none;
  color: $color-text;
  transition: opacity 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  &[href]:hover { opacity: 0.8; }
  &:not([href]) { cursor: default; }

  .circle {
    position: relative;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 0.5px solid $color-text;
    overflow: hidden;
    @include mq() {
      width: 38px;
      height: 38px;
    }
  }

  &.has-photo .circle {
    border-color: transparent;
  }

  .thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .day-num {
    font-size: 13px;
    line-height: 1;
    @include mq() { font-size: getVw(11); }
  }
}

// =====================================================================
// 月別デザイン
// =====================================================================

@keyframes snowfall {
  0% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(100vh);
  }
}

// 1月 - JAN
.main.month-1 {
  font-family: $font-bentham;
  background-color: #c3d3ed;

  .page-header {
    margin-bottom: 16px;
  }

  .snow {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  .flake {
    position: absolute;
    border-radius: 50%;
    filter: blur(1px);
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.82) 0%, rgba(255,255,255,0.5) 35%, rgba(255,255,255,0) 70%);
    animation: snowfall linear infinite;

    @for $i from 1 through 150 {
      &:nth-child(#{$i}) {
        $size: random(16) + 6px;
        width: $size;
        height: $size;
        left: percentage(random(100) * 0.01);
        animation-duration: (random(10) + 10) * 1s;
        animation-delay: (random(10) - 5) * 1s;
        opacity: random(8) * 0.1 + 0.2;
      }
    }
  }

  .back {
    color: $color-text;
  }

  .year-label {
    font-size: 16px;
    color: $color-text;
    @include mq() { font-size: 12px; }
  }

  .month-num-bg {
    font-size: getVw(120, 1440);
    color: $color-text;
    @include mq() { font-size: getVw(80); }
  }

  .month-name {
    font-size: getVw(40, 1440);
    color: $color-text;
    @include mq() { font-size: getVw(24); }
  }

  .wd {
    color: $color-text;
  }

  .circle {
    border-color: rgba(51, 51, 51, 0.3);
  }

  .day-num {
    color: $color-text;
  }
}

// 2月 - FEB
.main.month-2 {
  background-color: #835151;
  font-family: $font-caprasimo;
  color: $color-bg;

  .back {
    color: $color-bg;
  }

  .year-label {
    font-size: 24px;
    color: $color-bg;
    margin: 0;
    @include mq() { font-size: 20px; }
  }

  .month-num-bg {
    font-size: getVw(120, 1440);
    color: #411212;
    opacity: 0.5;
    padding-bottom: 0;
    @include mq() { font-size: getVw(80); }
  }

  .month-name {
    letter-spacing: 5%;
    font-size: getVw(56, 1440);
    color: $color-bg;
    @include mq() { font-size: getVw(32); }
  }

  .wd {
 
  }

  .circle {
    border-color: $color-bg;
  }

  .day-num {
    color: $color-bg;
  }
}

// 3月 - MAR
.main.month-3 {
  background-color: #cae0d0;
  font-family: $font-diplomata;
  color: #835151;

  .page-header {
    margin-bottom: 0;
  }

  .back {
    color: #835151;
  }

  .year-label {
    font-size: 16px;
    @include mq() { font-size: 12px; }
  }

  .month-num-bg {
    font-size: getVw(90, 1440);
    color: rgb(124, 185, 133);
    margin-top: 18px;
    @include mq() { font-size: getVw(60); }
  }

  .month-name {
    font-size: getVw(40, 1440);
    @include mq() { font-size: getVw(24); }
  }

  .wd {
    color: #835151;
    @include mq() { font-size: getVw(7); letter-spacing: -.1; }
  }

  .circle {
    border-color: #835151;
  }

  .day-num {
    color: #835151;
  }
}

@keyframes sakura-fall1  { to { transform: translateY(200px)  translateX(2560px) translateZ(200px)  rotate3d(1, .25, 0, 320deg); } }
@keyframes sakura-fall2  { to { transform: translateY(150px)  translateX(2560px) translateZ(500px)  rotate3d(1, .25, .25, 220deg); } }
@keyframes sakura-fall3  { to { transform: translateY(150px)  translateX(2560px) translateZ(300px)  rotate3d(.25, 1, 1, 420deg); } }
@keyframes sakura-fall4  { to { transform: translateY(-160px) translateX(2560px) translateZ(-500px) rotate3d(1, 1, .25, 720deg); } }
@keyframes sakura-fall5  { to { transform: translateY(-200px) translateX(2560px) translateZ(400px)  rotate3d(.25, 1, .25, 820deg); } }
@keyframes sakura-fall6  { to { transform: translateY(-300px) translateX(2560px) translateZ(-100px) rotate3d(1, 1, 1, 720deg); } }
@keyframes sakura-fall7  { to { transform: translateY(100px)  translateX(2560px) translateZ(350px)  rotate3d(.5, 1, .25, 480deg); } }
@keyframes sakura-fall8  { to { transform: translateY(-100px) translateX(2560px) translateZ(-300px) rotate3d(1, .5, 1, 600deg); } }
@keyframes sakura-fall9  { to { transform: translateY(250px)  translateX(2560px) translateZ(450px)  rotate3d(.25, .5, 1, 260deg); } }
@keyframes sakura-fall10 { to { transform: translateY(-250px) translateX(2560px) translateZ(-200px) rotate3d(1, 1, .5, 540deg); } }
@keyframes sakura-fall11 { to { transform: translateY(180px)  translateX(2560px) translateZ(-400px) rotate3d(.75, .25, 1, 380deg); } }
@keyframes sakura-fall12 { to { transform: translateY(-180px) translateX(2560px) translateZ(250px)  rotate3d(1, .75, .25, 660deg); } }

// 4月 - APR
.main.month-4 {
  .sakura {
    position: fixed;
    left: -20px;
    top: 0;
    right: 0;
    bottom: 0;
    width: calc(100% + 20px);
    height: 100vh;
    overflow: hidden;
    perspective: 1000px;
    pointer-events: none;
    z-index: 0;
  }

  .sakura__petal {
    position: absolute;
    top: 0;
    left: 0;
    width: 10px;
    height: 10px;
    background: #ffb7c5;
    box-shadow: inset 3px 3px 5px -3px #ffd6e0;
    border-radius: 15px 5px 15px 0;
    backface-visibility: hidden;
    transform-style: preserve-3d;
    animation: sakura-fall1 10s linear infinite;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: #e8638a;
      border-radius: 15px 5px 15px 0;
      transform: rotateY(180deg);
      transform-style: preserve-3d;
      backface-visibility: hidden;
    }

    &:nth-child(2)  { animation-name: sakura-fall2;  animation-delay: -2s;   top: 10%; }
    &:nth-child(3)  { animation-name: sakura-fall3;  animation-delay: -5s;   top: 25%; }
    &:nth-child(4)  { animation-name: sakura-fall4;  animation-delay: -1s;   top: 30%; }
    &:nth-child(5)  { animation-name: sakura-fall5;  animation-delay: -7s;   top: 50%; }
    &:nth-child(6)  { animation-name: sakura-fall6;  animation-delay: -3s;   top: 75%; }
    &:nth-child(7)  { animation-name: sakura-fall7;  animation-delay: -8s;   top: 15%; }
    &:nth-child(8)  { animation-name: sakura-fall8;  animation-delay: -4s;   top: 40%; }
    &:nth-child(9)  { animation-name: sakura-fall9;  animation-delay: -9s;   top: 60%; }
    &:nth-child(10) { animation-name: sakura-fall10; animation-delay: -6s;   top: 80%; }
    &:nth-child(11) { animation-name: sakura-fall11; animation-delay: -1.5s; top: 35%; }
    &:nth-child(12) { animation-name: sakura-fall12; animation-delay: -3.5s; top: 55%; }
    &:nth-child(13) { animation-name: sakura-fall1;  animation-delay: -7.5s; top: 20%; }
    &:nth-child(14) { animation-name: sakura-fall2;  animation-delay: -0.5s; top: 70%; }
    &:nth-child(15) { animation-name: sakura-fall3;  animation-delay: -4.5s; top: 45%; }
    &:nth-child(16) { animation-name: sakura-fall4;  animation-delay: -2.5s; top: 5%;  }
    &:nth-child(17) { animation-name: sakura-fall5;  animation-delay: -6.5s; top: 85%; }
    &:nth-child(18) { animation-name: sakura-fall6;  animation-delay: -3.2s; top: 65%; }
    &:nth-child(19) { animation-name: sakura-fall7;  animation-delay: -8.5s; top: 30%; }
    &:nth-child(20) { animation-name: sakura-fall8;  animation-delay: -1.8s; top: 90%; }
    &:nth-child(21) { animation-name: sakura-fall9;  animation-delay: -5.5s; top: 10%; }
    &:nth-child(22) { animation-name: sakura-fall10; animation-delay: -9.5s; top: 50%; }
    &:nth-child(23) { animation-name: sakura-fall11; animation-delay: -4.2s; top: 75%; }
    &:nth-child(24) { animation-name: sakura-fall12; animation-delay: -7.2s; top: 22%; }
  }
  background: linear-gradient(0deg, #dacefa 0%, #e9d5e9 40%, #f2d9e0 80%);
  color: #c85aa0;
  font-family: $font-bentham;
  .back {
    color: #c85aa0;
  }

  .page-header {
    margin-bottom: 0;
  }


  .month-num-bg {
    font-size: getVw(120, 1440);
    color: #df97c4;
    margin-bottom: 20px;
    @include mq() { font-size: getVw(80); }
  }

  .month-name {
    font-size: getVw(40, 1440);
    @include mq() { font-size: getVw(24); }
  }

  .wd {
    color: #c85aa0;
  }

  .circle {
    border-color: #c85aa0;
  }

  .day-num {
    color: #c85aa0;

  }
}

// 5月 - MAY
.main.month-5 {
  background-color: #78b9dc;
  color: $color-bg;
  font-family: $font-knewave;

  .back {
    color: $color-bg;
  }

  .page-header {
    margin-bottom: 0;
  }

  .year-label {
    font-size: 16px;
    @include mq() { font-size: 12px; }
  }

  .month-num-bg {
    font-size: getVw(100, 1440);
    color: rgb(142, 184, 206);
    @include mq() { font-size: getVw(60); }
  }

  .month-name {
    font-size: getVw(48, 1440);
    letter-spacing: 7%;
    @include mq() { font-size: getVw(32); }
  }

  .wd {
    color: $color-bg;
  }

  .circle {
    border-color: $color-bg;
  }

  .day-num {
    color: $color-bg;
  }
}

@keyframes rain-drop {
  0%   { transform: translateY(0vh); }
  75%  { transform: translateY(90vh); }
  100% { transform: translateY(90vh); }
}
@keyframes rain-stem {
  0%   { opacity: 1; }
  65%  { opacity: 1; }
  75%  { opacity: 0; }
  100% { opacity: 0; }
}
@keyframes rain-splat {
  0%   { opacity: 1; transform: scale(0); }
  80%  { opacity: 1; transform: scale(0); }
  90%  { opacity: 0.5; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.5); }
}

// 6月 - JUN
.main.month-6 {
  background: linear-gradient(0deg, #e4baef 0%, #9cd3dc 40%, #c7dce7 80%);
  font-family: $font-nunito;
  color: #28536e;

  .back {
    color: #28536e;
  }
  .page-header {
    margin-bottom: 0;
  }

  .year-label {
    font-size: 16px;
    @include mq() { font-size: 12px; }
  }

  .month-num-bg {
    font-size: getVw(100, 1440);
    color: #98cbdc;
    margin-top: 16px;
    font-weight: 700;
    @include mq() { font-size: getVw(60); }
  }

  .month-name {
    font-size: getVw(40, 1440);
    font-weight: 700;
    @include mq() { font-size: getVw(24); }
  }

  .wd {
    color: #28536e;
  }

  .circle {
    border-color: #28536e;
  }

  .day-num {
    color: #28536e;
  }

  .rain {
    position: fixed;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    opacity: 0.6;
  }

  .rain--back {
    z-index: 0;
    bottom: 60px;
  }

  :deep(.rain__drop) {
    position: absolute;
    bottom: 100%;
    width: 15px;
    height: 120px;
    pointer-events: none;
    animation: rain-drop 0.5s linear infinite;
  }

  :deep(.rain__stem) {
    width: 1px;
    height: 60%;
    margin-left: 7px;
    background: linear-gradient(to bottom, rgba(40,83,110,0), rgb(255, 255, 255));
    animation: rain-stem 0.5s linear infinite;
  }

  :deep(.rain__splat) {
    width: 15px;
    height: 10px;
    border-top: 2px dotted rgba(40,83,110,0.6);
    border-radius: 50%;
    transform: scale(0);
    animation: rain-splat 0.5s linear infinite;
  }
}

// 7月 - JUL
.main.month-7 {
  // background-color: ;

  // .back {
  //   color: ;
  // }

  // .year-label {
  //   font-family: ;
  //   font-size: 16px;
  //   color: ;
  //   @include mq() { font-size: 12px; }
  // }

  // .month-num-bg {
  //   font-family: ;
  //   font-size: getVw(120, 1440);
  //   color: ;
  //   @include mq() { font-size: getVw(80); }
  // }

  // .month-name {
  //   font-family: ;
  //   font-size: getVw(40, 1440);
  //   color: ;
  //   @include mq() { font-size: getVw(24); }
  // }

  // .wd {
  //   font-family: ;
  //   color: ;
  // }

  // .circle {
  //   border-color: ;
  // }

  // .day-num {
  //   font-family: ;
  //   color: ;
  // }
}

// 8月 - AUG
.main.month-8 {
  background: linear-gradient(0deg, #0f71ab 0%,  #14a8e3 100%);
  color: #f9a94e;
  font-family: $font-caprasimo;ß

  .page-header {
    margin-bottom: 16px;
  }

  .back {
    color: #f9a94e;
  }

  .year-label {
    font-size: 16px;
    @include mq() { font-size: 12px; }
  }

  .month-num-bg {
    font-size: getVw(120, 1440);
    color: #2093e5;
    @include mq() { font-size: getVw(80); }
  }

  .month-name {
    font-size: getVw(56, 1440);
    @include mq() { font-size: getVw(32); }
  }

  .wd {
    color: #f9a94e;
  }

  .circle {
    border-color: #f9a94e;
  }

  .day-num {
    color: #f9a94e;
  }
}

// 9月 - SEP
.main.month-9 {
  background-color: #997f9f;
  font-family: $font-knewave;
  color: $color-bg;

  .back {
    color: $color-bg;
  }

  .year-label {
    font-size: 16px;
    @include mq() { font-size: 12px; }
  }

  .month-num-bg {
    font-size: getVw(120, 1440);
    color: #bca3c2;
    @include mq() { font-size: getVw(80); }
  }

  .month-name {
    font-size: getVw(40, 1440);
    @include mq() { font-size: getVw(24); }
  }

  .wd {
    color: $color-bg;
  }

  .circle {
    border-color: $color-bg;
  }

  .day-num {
    color: $color-bg;
  }
}

// 10月 - OCT
.main.month-10 {
  // background-color: ;

  // .back {
  //   color: ;
  // }

  // .year-label {
  //   font-family: ;
  //   font-size: 16px;
  //   color: ;
  //   @include mq() { font-size: 12px; }
  // }

  // .month-num-bg {
  //   font-family: ;
  //   font-size: getVw(120, 1440);
  //   color: ;
  //   @include mq() { font-size: getVw(80); }
  // }

  // .month-name {
  //   font-family: ;
  //   font-size: getVw(40, 1440);
  //   color: ;
  //   @include mq() { font-size: getVw(24); }
  // }

  // .wd {
  //   font-family: ;
  //   color: ;
  // }

  // .circle {
  //   border-color: ;
  // }

  // .day-num {
  //   font-family: ;
  //   color: ;
  // }
}

// 11月 - NOV
.main.month-11 {
  // background-color: ;

  // .back {
  //   color: ;
  // }

  // .year-label {
  //   font-family: ;
  //   font-size: 16px;
  //   color: ;
  //   @include mq() { font-size: 12px; }
  // }

  // .month-num-bg {
  //   font-family: ;
  //   font-size: getVw(120, 1440);
  //   color: ;
  //   @include mq() { font-size: getVw(80); }
  // }

  // .month-name {
  //   font-family: ;
  //   font-size: getVw(40, 1440);
  //   color: ;
  //   @include mq() { font-size: getVw(24); }
  // }

  // .wd {
  //   font-family: ;
  //   color: ;
  // }

  // .circle {
  //   border-color: ;
  // }

  // .day-num {
  //   font-family: ;
  //   color: ;
  // }
}

// 12月 - DEC
.main.month-12 {
  // background-color: ;

  // .back {
  //   color: ;
  // }

  // .year-label {
  //   font-family: ;
  //   font-size: 16px;
  //   color: ;
  //   @include mq() { font-size: 12px; }
  // }

  // .month-num-bg {
  //   font-family: ;
  //   font-size: getVw(120, 1440);
  //   color: ;
  //   @include mq() { font-size: getVw(80); }
  // }

  // .month-name {
  //   font-family: ;
  //   font-size: getVw(40, 1440);
  //   color: ;
  //   @include mq() { font-size: getVw(24); }
  // }

  // .wd {
  //   font-family: ;
  //   color: ;
  // }

  // .circle {
  //   border-color: ;
  // }

  // .day-num {
  //   font-family: ;
  //   color: ;
  // }
}
</style>
