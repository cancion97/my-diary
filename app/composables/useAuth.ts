export const useAuth = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const token = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 30 })

  const isLoggedIn = computed(() => !!token.value)

  const login = async (password: string) => {
    const res = await $fetch<{ token: string }>(`${apiBase}/auth/login`, {
      method: 'POST',
      body: { password },
    })
    token.value = res.token
  }

  const logout = () => {
    token.value = null
  }

  return { token, isLoggedIn, login, logout, apiBase }
}
