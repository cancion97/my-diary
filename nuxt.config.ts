// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Nuxt 4 のディレクトリ構造を有効にします
  future: {
    compatibilityVersion: 4,
  },

  // SSRを無効化（SPAモード）→ vite-nodeのIPC問題を回避
  ssr: false,

  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Bentham&family=Modak&display=swap',
        },
      ],
    },
  },

  css: ['~/assets/scss/_ress.scss'],

  modules: ['@nuxt/image'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/common" as *;\n@use "~/assets/scss/mixin" as *;\n',
        },
      },
    },
  },
})