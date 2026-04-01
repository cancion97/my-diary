<script setup lang="ts">
import { computed } from 'vue'

// Propsの定義
interface Props {
  imageUrl: string;
  comment?: string | null; // Optional
  createdAt: string;
}

const props = defineProps<Props>();

// 日付のフォーマット（必要ならここで整形）
const formattedDate = computed(() => {
  return new Date(props.createdAt).toLocaleDateString();
});
</script>

<template>
  <div class="diary-card">
    <div class="photo-wrapper">
      <img :src="props.imageUrl" alt="Diary Photo" class="diary-photo" />
    </div>
    
    <div v-if="props.comment" class="comment">
      {{ props.comment }}
    </div>
    
    <div class="date">
      {{ formattedDate }}
    </div>
  </div>
</template>

<style scoped>
.diary-card {
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  background: #fff;
}
.diary-photo {
  width: 100%;
  height: auto;
  border-radius: 8px;
  display: block;
}
.comment {
  margin-top: 12px;
  font-size: 1.1rem;
  font-weight: bold;
}
.date {
  margin-top: 8px;
  color: #888;
  font-size: 0.9rem;
}
</style>