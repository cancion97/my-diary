<script setup lang="ts">
definePageMeta({ layout: false })

const { login, isLoggedIn } = useAuth()
const password = ref('')
const error = ref('')
const loading = ref(false)

if (isLoggedIn.value) {
  navigateTo('/admin')
}

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    await login(password.value)
    navigateTo('/admin')
  } catch {
    error.value = 'パスワードが違います'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login">
    <div class="login__box">
      <NuxtImg src="/images/365.svg" alt="365" class="login__logo" />
      <form class="login__form" @submit.prevent="handleLogin">
        <input
          v-model="password"
          type="password"
          class="login__input"
          placeholder="パスワード"
          autocomplete="current-password"
          :style="{ fontFamily: 'Noto Sans JP, sans-serif' }"
        />
        <p v-if="error" class="login__error">{{ error }}</p>
        <button type="submit" class="login__btn" :disabled="loading">
          {{ loading ? '...' : 'ログイン' }}
        </button>
      </form>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.login {
  min-height: 100vh;
  background-color: $color-bg;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login__box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.login__logo {
  width: 120px;
}

.login__form {
  font-family: $font-noto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 240px;
}

.login__input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid $color-border;
  border-radius: 4px;
  font-size: 14px;
  font-family: $font-noto;
  background: #fff;
  color: $color-text;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: $color-text;
  }
}

.login__error {
  font-size: 12px;
  color: #c0392b;
  margin: 0;
}

.login__btn {
  width: 100%;
  padding: 10px;
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
</style>
