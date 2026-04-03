// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  ssr: false,

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:5159',
    },
  },

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
          rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bentham&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Modak&family=Caprasimo&family=Knewave&family=Limelight&family=Moirai+One&family=Noto+Sans+JP:wght@400;500&family=Nunito:ital,wght@0,200..1000;1,200..1000&family=Diplomata&display=swap',
         
        },
      ],
    },
  },

  css: ['~/assets/scss/_ress.scss'],

  modules: ['@nuxt/image'],

  image: {
    quality: 80,
    format: ['webp'],
  },

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