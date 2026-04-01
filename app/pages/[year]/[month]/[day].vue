<template>
  <div>
    <h1>{{ $route.params.day }}日の日記詳細</h1>
    <NuxtLink :to="`/${$route.params.year}/${$route.params.month}`">カレンダーに戻る</NuxtLink>
  </div>
</template>