<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'

function applyTheme(theme) {
  if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

onMounted(() => {
  // 启动时初始化主题
  try {
    const saved = localStorage.getItem('app-settings')
    if (saved) {
      const data = JSON.parse(saved)
      if (data.theme) applyTheme(data.theme)
    }
  } catch {}

  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    try {
      const saved = localStorage.getItem('app-settings')
      if (saved) {
        const data = JSON.parse(saved)
        if (data.theme === 'auto') applyTheme('auto')
      } else {
        applyTheme('auto')
      }
    } catch {}
  })
})
</script>

<style>
/* ── 全局重置 ──────────────────────────────────────────── */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #1e1e2e;
  color: #cdd6f4;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 全局滚动条美化 */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #45475a; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #585b70; }
</style>