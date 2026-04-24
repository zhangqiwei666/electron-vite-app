<template>
  <div class="workspace">
    <!-- 顶部标题栏 -->
    <header class="titlebar">
      <div class="titlebar-left">
        <div class="app-logo">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><rect x="2" y="2" width="20" height="20" rx="6" fill="url(#tg)"/><path d="M8 12l3 3 5-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="tg" x1="2" y1="2" x2="22" y2="22"><stop stop-color="#6366f1"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs></svg>
        </div>
        <nav class="menu-bar">
          <span class="menu-item" v-for="m in menus" :key="m">{{ m }}</span>
        </nav>
      </div>
      <div class="titlebar-center">
        <span class="project-name">📂 My Electron Workspace</span>
      </div>
      <div class="titlebar-right">
        <span class="user-badge">👤 {{ currentUser }}</span>
        <button class="logout-btn" @click="handleLogout">退出</button>
      </div>
    </header>

    <div class="main-area">
      <!-- 左侧边栏：文件树 -->
      <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <span v-if="!sidebarCollapsed" class="sidebar-title">资源管理器</span>
          <button class="collapse-btn" @click="sidebarCollapsed=!sidebarCollapsed">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path :d="sidebarCollapsed?'M9 18l6-6-6-6':'M15 18l-6-6 6-6'"/></svg>
          </button>
        </div>
        <div v-if="!sidebarCollapsed" class="file-tree">
          <div class="tree-section">
            <div class="tree-folder" @click="toggleFolder('src')">
              <span class="tree-arrow" :class="{open:openFolders.src}">▶</span>
              <span class="folder-icon">📁</span> src
            </div>
            <div v-if="openFolders.src" class="tree-children">
              <div v-for="f in srcFiles" :key="f.name" class="tree-file" :class="{active: activeFile===f.name}" @click="openFile(f)">
                <span class="file-icon">{{ f.icon }}</span> {{ f.name }}
              </div>
            </div>
          </div>
          <div class="tree-section">
            <div class="tree-folder" @click="toggleFolder('config')">
              <span class="tree-arrow" :class="{open:openFolders.config}">▶</span>
              <span class="folder-icon">📁</span> config
            </div>
            <div v-if="openFolders.config" class="tree-children">
              <div v-for="f in configFiles" :key="f.name" class="tree-file" :class="{active: activeFile===f.name}" @click="openFile(f)">
                <span class="file-icon">{{ f.icon }}</span> {{ f.name }}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 中央编辑区 -->
      <div class="editor-area">
        <!-- 标签栏 -->
        <div class="tab-bar">
          <div v-for="tab in openTabs" :key="tab.name" class="tab" :class="{active: activeFile===tab.name}" @click="switchTab(tab)">
            <span class="tab-icon">{{ tab.icon }}</span>
            <span class="tab-name">{{ tab.name }}</span>
            <button class="tab-close" @click.stop="closeTab(tab)">×</button>
          </div>
        </div>
        <!-- 面包屑 -->
        <div class="breadcrumb">
          <span>my-app</span><span class="sep">›</span>
          <span>src</span><span class="sep">›</span>
          <span class="current">{{ activeFile || '欢迎' }}</span>
        </div>
        <!-- 编辑器内容 -->
        <div class="editor-content">
          <div v-if="!activeFile" class="welcome-screen">
            <div class="welcome-logo">
              <svg viewBox="0 0 48 48" width="64" height="64" fill="none"><rect x="4" y="4" width="40" height="40" rx="12" fill="url(#wg)"/><path d="M16 24L22 30L32 18" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="wg" x1="4" y1="4" x2="44" y2="44"><stop stop-color="#6366f1"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs></svg>
            </div>
            <h2 class="welcome-title">My Electron Workspace</h2>
            <p class="welcome-sub">选择左侧文件开始编辑，或使用快捷键操作</p>
            <div class="shortcut-grid">
              <div class="shortcut-card" v-for="s in shortcuts" :key="s.label">
                <kbd>{{ s.key }}</kbd><span>{{ s.label }}</span>
              </div>
            </div>
          </div>
          <div v-else class="code-view">
            <div class="line-numbers">
              <span v-for="n in currentLines" :key="n" class="ln">{{ n }}</span>
            </div>
            <div class="code-content">
              <textarea v-model="currentCode" class="code-textarea" spellcheck="false" @input="markDirty"></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧活动栏 -->
      <aside class="activity-bar">
        <div class="act-icon" v-for="a in activities" :key="a.label" :title="a.label" :class="{active: activeActivity===a.label}" @click="activeActivity=a.label">
          {{ a.icon }}
        </div>
      </aside>
    </div>

    <!-- 底部状态栏 -->
    <footer class="statusbar">
      <div class="status-left">
        <span class="status-item branch">🌿 main</span>
        <span class="status-item">{{ openTabs.length }} 个打开的文件</span>
        <span class="status-item" v-if="isDirty">● 未保存</span>
      </div>
      <div class="status-right">
        <span class="status-item">行 {{ cursorLine }}, 列 {{ cursorCol }}</span>
        <span class="status-item">UTF-8</span>
        <span class="status-item">JavaScript</span>
        <span class="status-item notify">🔔</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const currentUser = ref(sessionStorage.getItem('username') || 'User')
const sidebarCollapsed = ref(false)
const activeFile = ref('')
const activeActivity = ref('文件')
const isDirty = ref(false)
const cursorLine = ref(1)
const cursorCol = ref(1)

const menus = ['文件', '编辑', '查看', '终端', '帮助']
const openFolders = ref({ src: true, config: false })

const srcFiles = [
  { name: 'main.js', icon: '📄', lang: 'javascript', content: `const { app, BrowserWindow } = require('electron')\nconst path = require('node:path')\n\nfunction createWindow() {\n  const mainWindow = new BrowserWindow({\n    width: 800,\n    height: 600,\n    webPreferences: {\n      preload: path.join(__dirname, 'preload.js')\n    }\n  })\n  mainWindow.loadFile('index.html')\n}\n\napp.whenReady().then(createWindow)\n` },
  { name: 'preload.js', icon: '🔧', lang: 'javascript', content: `const { contextBridge, ipcRenderer } = require('electron')\n\ncontextBridge.exposeInMainWorld('electronAPI', {\n  // API methods here\n})\n` },
  { name: 'renderer.js', icon: '🎨', lang: 'javascript', content: `import { createApp } from 'vue'\nimport App from './app.vue'\nimport './index.css'\n\ncreateApp(App).mount('#app')\n` },
  { name: 'app.vue', icon: '💚', lang: 'vue', content: `<template>\n  <div id="app">\n    <h1>Hello Electron + Vue</h1>\n  </div>\n</template>\n\n<script setup>\nimport { ref } from 'vue'\nconst msg = ref('Hello')\n<\/script>\n` },
  { name: 'index.css', icon: '🎨', lang: 'css', content: `body {\n  font-family: 'Inter', sans-serif;\n  margin: 0;\n  padding: 0;\n  background: #1e1e2e;\n  color: #cdd6f4;\n}\n` },
]

const configFiles = [
  { name: 'package.json', icon: '📦', lang: 'json', content: `{\n  "name": "my-app",\n  "version": "1.0.3",\n  "main": ".vite/build/main.js"\n}\n` },
  { name: 'vite.config.mjs', icon: '⚡', lang: 'javascript', content: `import { defineConfig } from 'vite'\nimport vue from '@vitejs/plugin-vue'\n\nexport default defineConfig({\n  plugins: [vue()]\n})\n` },
  { name: '.gitignore', icon: '🙈', lang: 'text', content: `node_modules/\ndist/\n.env\n*.log\n` },
]

const openTabs = ref([])
const currentCode = ref('')

const shortcuts = [
  { key: 'Ctrl+S', label: '保存文件' },
  { key: 'Ctrl+P', label: '快速打开' },
  { key: 'Ctrl+`', label: '打开终端' },
  { key: 'Ctrl+B', label: '切换侧栏' },
]

const activities = [
  { icon: '📁', label: '文件' },
  { icon: '🔍', label: '搜索' },
  { icon: '🔀', label: 'Git' },
  { icon: '🧩', label: '扩展' },
  { icon: '⚙️', label: '设置' },
]

const currentLines = computed(() => {
  if (!currentCode.value) return 0
  return currentCode.value.split('\n').length
})

function toggleFolder(name) { openFolders.value[name] = !openFolders.value[name] }

function openFile(f) {
  activeFile.value = f.name
  currentCode.value = f.content
  isDirty.value = false
  if (!openTabs.value.find(t => t.name === f.name)) openTabs.value.push(f)
}

function switchTab(tab) { activeFile.value = tab.name; currentCode.value = tab.content; isDirty.value = false }

function closeTab(tab) {
  const idx = openTabs.value.findIndex(t => t.name === tab.name)
  openTabs.value.splice(idx, 1)
  if (activeFile.value === tab.name) {
    if (openTabs.value.length) { const next = openTabs.value[Math.min(idx, openTabs.value.length-1)]; activeFile.value = next.name; currentCode.value = next.content }
    else { activeFile.value = ''; currentCode.value = '' }
  }
}

function markDirty() { isDirty.value = true }
function handleLogout() { sessionStorage.clear(); router.push('/login') }

onMounted(() => { cursorLine.value = 1; cursorCol.value = 1 })
</script>

<style scoped>
/* ── 全局 ──────────────────────────────── */
.workspace { display:flex; flex-direction:column; height:100vh; background:#1e1e2e; color:#cdd6f4; font-family:'Cascadia Code','JetBrains Mono','Fira Code','Consolas',monospace; font-size:13px; overflow:hidden; }

/* ── 标题栏 ────────────────────────────── */
.titlebar { display:flex; align-items:center; justify-content:space-between; height:38px; background:#181825; border-bottom:1px solid #313244; padding:0 12px; -webkit-app-region:drag; flex-shrink:0; }
.titlebar-left,.titlebar-right { display:flex; align-items:center; gap:8px; -webkit-app-region:no-drag; }
.titlebar-center { position:absolute; left:50%; transform:translateX(-50%); }
.app-logo { display:flex; align-items:center; }
.menu-bar { display:flex; gap:2px; }
.menu-item { padding:4px 10px; border-radius:4px; cursor:pointer; color:#bac2de; transition:background 0.15s; font-family:'Segoe UI',sans-serif; font-size:12px; }
.menu-item:hover { background:#313244; color:#cdd6f4; }
.project-name { font-size:12px; color:#a6adc8; font-family:'Segoe UI',sans-serif; }
.user-badge { font-size:12px; color:#89b4fa; font-family:'Segoe UI',sans-serif; }
.logout-btn { padding:3px 10px; background:rgba(243,139,168,0.15); color:#f38ba8; border:1px solid rgba(243,139,168,0.2); border-radius:4px; cursor:pointer; font-size:11px; transition:all 0.2s; }
.logout-btn:hover { background:rgba(243,139,168,0.25); }

/* ── 主内容区 ──────────────────────────── */
.main-area { display:flex; flex:1; overflow:hidden; }

/* ── 侧边栏 ────────────────────────────── */
.sidebar { width:240px; background:#181825; border-right:1px solid #313244; display:flex; flex-direction:column; transition:width 0.2s; flex-shrink:0; }
.sidebar.collapsed { width:0; overflow:hidden; border:none; }
.sidebar-header { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid #313244; }
.sidebar-title { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#a6adc8; font-family:'Segoe UI',sans-serif; }
.collapse-btn { background:none; border:none; color:#6c7086; cursor:pointer; padding:2px; display:flex; border-radius:4px; transition:all 0.15s; }
.collapse-btn:hover { color:#cdd6f4; background:#313244; }
.file-tree { flex:1; overflow-y:auto; padding:6px 0; }
.tree-section { margin-bottom:2px; }
.tree-folder { display:flex; align-items:center; gap:4px; padding:4px 12px; cursor:pointer; color:#cdd6f4; transition:background 0.1s; font-family:'Segoe UI',sans-serif; }
.tree-folder:hover { background:#313244; }
.tree-arrow { font-size:8px; transition:transform 0.2s; display:inline-block; width:12px; color:#6c7086; }
.tree-arrow.open { transform:rotate(90deg); }
.folder-icon { font-size:14px; }
.tree-children { padding-left:12px; }
.tree-file { display:flex; align-items:center; gap:6px; padding:3px 12px 3px 28px; cursor:pointer; color:#bac2de; transition:all 0.1s; border-radius:0; font-family:'Segoe UI',sans-serif; font-size:12px; }
.tree-file:hover { background:#313244; color:#cdd6f4; }
.tree-file.active { background:rgba(137,180,250,0.1); color:#89b4fa; border-right:2px solid #89b4fa; }
.file-icon { font-size:13px; }

/* ── 编辑器区 ──────────────────────────── */
.editor-area { flex:1; display:flex; flex-direction:column; min-width:0; }
.tab-bar { display:flex; background:#11111b; border-bottom:1px solid #313244; overflow-x:auto; flex-shrink:0; }
.tab-bar::-webkit-scrollbar { height:0; }
.tab { display:flex; align-items:center; gap:6px; padding:8px 14px; cursor:pointer; color:#6c7086; border-right:1px solid #313244; transition:all 0.15s; min-width:0; white-space:nowrap; font-family:'Segoe UI',sans-serif; font-size:12px; }
.tab.active { background:#1e1e2e; color:#cdd6f4; border-bottom:2px solid #89b4fa; }
.tab:hover:not(.active) { background:#181825; }
.tab-icon { font-size:13px; }
.tab-close { background:none; border:none; color:#6c7086; cursor:pointer; padding:0 2px; font-size:14px; border-radius:2px; transition:all 0.1s; line-height:1; }
.tab-close:hover { background:#313244; color:#f38ba8; }
.breadcrumb { padding:4px 16px; font-size:11px; color:#6c7086; border-bottom:1px solid rgba(49,50,68,0.5); flex-shrink:0; font-family:'Segoe UI',sans-serif; }
.sep { margin:0 4px; }
.breadcrumb .current { color:#89b4fa; }

.editor-content { flex:1; overflow:auto; position:relative; }

/* ── 欢迎页 ────────────────────────────── */
.welcome-screen { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:16px; animation:fadeIn 0.5s ease; }
@keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
.welcome-logo { filter:drop-shadow(0 4px 20px rgba(99,102,241,0.3)); }
.welcome-title { margin:0; font-size:22px; font-weight:600; color:#cdd6f4; font-family:'Segoe UI',sans-serif; }
.welcome-sub { margin:0; font-size:13px; color:#6c7086; font-family:'Segoe UI',sans-serif; }
.shortcut-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:12px; }
.shortcut-card { display:flex; align-items:center; gap:10px; padding:10px 16px; background:rgba(49,50,68,0.4); border-radius:8px; border:1px solid #313244; transition:all 0.2s; }
.shortcut-card:hover { background:rgba(49,50,68,0.7); border-color:#45475a; }
.shortcut-card kbd { padding:3px 8px; background:#11111b; border:1px solid #45475a; border-radius:4px; font-size:11px; color:#89b4fa; font-family:inherit; }
.shortcut-card span { color:#a6adc8; font-size:12px; font-family:'Segoe UI',sans-serif; }

/* ── 代码视图 ──────────────────────────── */
.code-view { display:flex; height:100%; }
.line-numbers { padding:8px 0; min-width:50px; text-align:right; background:#181825; border-right:1px solid #313244; user-select:none; overflow:hidden; }
.ln { display:block; padding:0 12px 0 0; line-height:1.6; color:#45475a; font-size:13px; }
.code-content { flex:1; position:relative; }
.code-textarea { width:100%; height:100%; padding:8px 16px; background:transparent; border:none; color:#cdd6f4; font-family:inherit; font-size:13px; line-height:1.6; resize:none; outline:none; tab-size:2; box-sizing:border-box; }
.code-textarea::selection { background:rgba(137,180,250,0.2); }

/* ── 活动栏 ─────────────────────────────── */
.activity-bar { width:42px; background:#11111b; border-left:1px solid #313244; display:flex; flex-direction:column; align-items:center; padding:8px 0; gap:4px; flex-shrink:0; }
.act-icon { width:34px; height:34px; display:flex; align-items:center; justify-content:center; border-radius:8px; cursor:pointer; font-size:16px; transition:all 0.15s; }
.act-icon:hover { background:#313244; }
.act-icon.active { background:rgba(137,180,250,0.12); box-shadow:inset 2px 0 0 #89b4fa; }

/* ── 状态栏 ─────────────────────────────── */
.statusbar { display:flex; align-items:center; justify-content:space-between; height:24px; background:#181825; border-top:1px solid #313244; padding:0 10px; flex-shrink:0; }
.status-left,.status-right { display:flex; align-items:center; gap:2px; }
.status-item { padding:2px 8px; font-size:11px; color:#6c7086; cursor:default; font-family:'Segoe UI',sans-serif; }
.status-item.branch { color:#a6e3a1; }
.status-item.notify { cursor:pointer; }

</style>