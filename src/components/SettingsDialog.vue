<template>
  <GlobalDialog
    v-model="visible"
    title="应用设置"
    width="520px"
    confirm-text="保存设置"
    @confirm="saveSettings"
    @close="$emit('update:modelValue', false)"
  >
    <div class="settings-body">
      <!-- 下载路径设置 -->
      <div class="setting-section">
        <div class="setting-header">
          <span class="setting-icon">📁</span>
          <div>
            <h4 class="setting-title">下载文件存放位置</h4>
            <p class="setting-desc">设置应用内下载的文件默认保存路径</p>
          </div>
        </div>
        <div class="setting-control">
          <el-input v-model="settings.downloadPath" placeholder="请选择文件夹..." readonly size="default" class="path-input">
            <template #append>
              <el-button @click="selectDownloadPath">浏览</el-button>
            </template>
          </el-input>
        </div>
      </div>

      <el-divider />

      <!-- 快捷键设置 -->
      <div class="setting-section">
        <div class="setting-header">
          <span class="setting-icon">⌨️</span>
          <div>
            <h4 class="setting-title">快捷键设置</h4>
            <p class="setting-desc">自定义全局快捷键（需重启生效）</p>
          </div>
        </div>
        <div class="shortcut-list">
          <div class="shortcut-row" v-for="s in settings.shortcuts" :key="s.label">
            <span class="shortcut-label">{{ s.label }}</span>
            <div class="shortcut-keys">
              <kbd v-for="k in s.keys.split('+')" :key="k">{{ k.trim() }}</kbd>
            </div>
            <el-input
              v-model="s.keys"
              size="small"
              class="shortcut-input"
              placeholder="如 Ctrl+Shift+S"
              @keydown="captureShortcut($event, s)"
            />
          </div>
        </div>
      </div>

      <el-divider />

      <!-- 外观 -->
      <div class="setting-section">
        <div class="setting-header">
          <span class="setting-icon">🎨</span>
          <div>
            <h4 class="setting-title">外观</h4>
            <p class="setting-desc">应用主题和显示偏好</p>
          </div>
        </div>
        <div class="setting-control">
          <div class="theme-options">
            <div class="theme-opt" :class="{ active: settings.theme === 'light' }" @click="settings.theme = 'light'">
              <span class="theme-preview light"></span>
              <span>浅色</span>
            </div>
            <div class="theme-opt" :class="{ active: settings.theme === 'dark' }" @click="settings.theme = 'dark'">
              <span class="theme-preview dark"></span>
              <span>深色</span>
            </div>
            <div class="theme-opt" :class="{ active: settings.theme === 'auto' }" @click="settings.theme = 'auto'">
              <span class="theme-preview auto"></span>
              <span>跟随系统</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </GlobalDialog>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue'
import GlobalDialog from './GlobalDialog.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const settings = reactive({
  downloadPath: '',
  theme: 'light',
  shortcuts: [
    { label: '显示主窗口', keys: 'Ctrl + Shift + S', action: 'show-main' },
    { label: '退出应用', keys: 'Ctrl + Shift + Q', action: 'quit' },
    { label: '新建任务', keys: 'Ctrl + N', action: 'new-task' },
    { label: '全局搜索', keys: 'Ctrl + K', action: 'search' },
  ]
})

async function selectDownloadPath() {
  try {
    const path = await window.electronAPI.selectFolder()
    if (path) settings.downloadPath = path
  } catch (e) {
    console.error('选择文件夹失败', e)
  }
}

function captureShortcut(e, shortcut) {
  e.preventDefault()
  const parts = []
  if (e.ctrlKey) parts.push('Ctrl')
  if (e.shiftKey) parts.push('Shift')
  if (e.altKey) parts.push('Alt')
  const key = e.key
  if (!['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
    parts.push(key.length === 1 ? key.toUpperCase() : key)
  }
  if (parts.length > 1) {
    shortcut.keys = parts.join(' + ')
  }
}

function applyTheme(theme) {
  if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function saveSettings() {
  localStorage.setItem('app-settings', JSON.stringify(settings))
  applyTheme(settings.theme)
  ElMessage.success('设置已保存')
  emit('update:modelValue', false)
}

function loadSettings() {
  try {
    const saved = localStorage.getItem('app-settings')
    if (saved) {
      const data = JSON.parse(saved)
      if (data.downloadPath) settings.downloadPath = data.downloadPath
      if (data.theme) settings.theme = data.theme
      if (data.shortcuts) settings.shortcuts = data.shortcuts
    }
  } catch {}
}

onMounted(() => loadSettings())
</script>

<style scoped>
.settings-body { padding: 0; }

.setting-section { padding: 20px 24px; }
.setting-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
.setting-icon { font-size: 22px; margin-top: 2px; }
.setting-title { margin: 0; font-size: 14px; font-weight: 700; color: #1a1a1a; }
.setting-desc { margin: 2px 0 0; font-size: 12px; color: #999; }
.setting-control { padding-left: 34px; }

:deep(.path-input .el-input__wrapper) { border-radius: 8px; }
:deep(.el-divider) { margin: 0; }

/* 快捷键 */
.shortcut-list { display: flex; flex-direction: column; gap: 10px; padding-left: 34px; }
.shortcut-row { display: flex; align-items: center; gap: 12px; }
.shortcut-label { width: 90px; font-size: 13px; color: var(--el-text-color-primary); font-weight: 500; flex-shrink: 0; }
.shortcut-keys { display: flex; gap: 4px; min-width: 140px; }
.shortcut-keys kbd {
  padding: 3px 8px; background: var(--el-fill-color-light); border: 1px solid var(--el-border-color);
  border-radius: 4px; font-size: 11px; font-family: 'Consolas', monospace;
  color: var(--el-text-color-primary); min-width: 20px; text-align: center;
}
.shortcut-input { width: 160px; }
:deep(.shortcut-input .el-input__wrapper) { border-radius: 6px; }

/* 主题 */
.theme-options { display: flex; gap: 12px; }
.theme-opt {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  cursor: pointer; padding: 10px 18px; border-radius: 10px;
  border: 2px solid transparent; transition: all 0.2s; font-size: 12px; color: var(--el-text-color-regular);
}
.theme-opt:hover { background: var(--el-fill-color-lighter); }
.theme-opt.active { border-color: var(--el-color-danger); background: var(--el-color-danger-light-9); color: var(--el-color-danger); font-weight: 600; }
.theme-preview { width: 48px; height: 32px; border-radius: 6px; border: 1px solid var(--el-border-color); }
.theme-preview.light { background: linear-gradient(135deg, #fff, #f5f5f7); }
.theme-preview.dark { background: linear-gradient(135deg, #1a1a2e, #16213e); }
.theme-preview.auto { background: linear-gradient(135deg, #fff 50%, #1a1a2e 50%); }
</style>
