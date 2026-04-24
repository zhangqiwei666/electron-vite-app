<template>
  <div class="layout">
    <!-- ═══ 左侧图标侧栏 ═══ -->
    <aside class="sidebar">
      <div class="sidebar-top">
        <!-- Logo -->
        <div class="sidebar-logo" @click="$router.push('/workspace/dashboard')">
          <div class="logo-box">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="#e74c3c"/>
              <rect x="7" y="7" width="4" height="4" rx="1" fill="#fff"/>
              <rect x="13" y="7" width="4" height="4" rx="1" fill="#fff" opacity="0.6"/>
              <rect x="7" y="13" width="4" height="4" rx="1" fill="#fff" opacity="0.6"/>
              <rect x="13" y="13" width="4" height="4" rx="1" fill="#fff" opacity="0.4"/>
            </svg>
          </div>
        </div>

        <!-- 导航图标 -->
        <div
          v-for="item in navItems"
          :key="item.path"
          class="nav-icon"
          :class="{ active: currentPath.includes(item.path) }"
          :title="item.title"
          @click="$router.push(item.path)"
        >
          <component :is="item.icon" class="icon-svg" />
        </div>
      </div>

      <!-- 底部操作区 -->
      <div class="sidebar-bottom">
        <el-dropdown placement="right-end" trigger="click" @command="handleUserCommand">
          <div class="user-avatar-sidebar" :title="currentUser">
            {{ currentUser.charAt(0).toUpperCase() }}
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item disabled>
                <div class="user-dropdown-info">
                  <span class="ud-name">{{ currentUser }}</span>
                  <span class="ud-role">在线</span>
                </div>
              </el-dropdown-item>
              <el-dropdown-item divided command="switch">🔄 切换用户</el-dropdown-item>
              <el-dropdown-item command="logout">🚪 退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <div class="nav-icon" title="设置" @click="showSettings = true">
          <Setting class="icon-svg" />
        </div>
      </div>
    </aside>

    <!-- ═══ 主内容区 ═══ -->
    <main class="main-content">
      <!-- 顶部栏 -->
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
          <span class="page-date">{{ todayStr }}</span>
        </div>
        <div class="topbar-right">
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="搜索任务、文档..."
              size="default"
              :prefix-icon="Search"
              class="search-input"
            />
          </div>
          <el-button type="danger" size="default" class="new-task-btn" @click="showNewTask = true">
            + 新建任务
          </el-button>
        </div>
      </header>

      <!-- 页面内容 -->
      <div class="page-content">
        <router-view />
      </div>
    </main>

    <!-- ═══ 弹窗组件 ═══ -->
    <SettingsDialog v-model="showSettings" />
    <NewTaskDialog v-model="showNewTask" @submit="onTaskCreated" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, Setting, Grid, ChatDotRound, DataLine, User, FolderOpened, Monitor, SwitchButton } from '@element-plus/icons-vue'
import SettingsDialog from '../components/SettingsDialog.vue'
import NewTaskDialog from '../components/NewTaskDialog.vue'

const route = useRoute()
const router = useRouter()
const searchQuery = ref('')
const currentUser = ref(sessionStorage.getItem('username') || 'Admin')
const showSettings = ref(false)
const showNewTask = ref(false)

const navItems = [
  { path: '/workspace/dashboard', title: '工作台', icon: Grid },
  { path: '/workspace/messages', title: '信息中心', icon: ChatDotRound },
  { path: '/workspace/analytics', title: '统计分析', icon: DataLine },
  { path: '/workspace/users', title: '用户数据', icon: User },
  { path: '/workspace/files', title: '资料管理', icon: FolderOpened },
  { path: '/workspace/monitor', title: '系统监控', icon: Monitor },
]

const currentPath = computed(() => route.path)
const pageTitle = computed(() => route.meta?.title || '工作台')

const todayStr = computed(() => {
  const d = new Date()
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `今日概览 · ${y}年${m}月${day}日 · 周${weekdays[d.getDay()]}`
})

function onTaskCreated(task) {
  console.log('新任务已创建:', task)
}

// ═══ 退出登录 & 切换用户 ═══
function handleLogout() {
  // 清除登录状态 + 清除保存的凭据
  sessionStorage.removeItem('isLoggedIn')
  sessionStorage.removeItem('username')
  localStorage.removeItem('saved-credentials')
  router.push('/login')
}

function handleSwitchUser() {
  // 清除当前会话但保留 localStorage 凭据（方便切回）
  sessionStorage.removeItem('isLoggedIn')
  sessionStorage.removeItem('username')
  // 标记这是主动切换用户，不要在登录页自动登录
  sessionStorage.setItem('manualLogout', 'true')
  router.push('/login')
}

function handleUserCommand(command) {
  if (command === 'logout') handleLogout()
  else if (command === 'switch') handleSwitchUser()
}
</script>

<style scoped>
.layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: var(--el-bg-color-page);
}

/* ═══ 侧边栏 ═══ */
.sidebar {
  width: 56px;
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  flex-shrink: 0;
}

.sidebar-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.sidebar-logo { margin-bottom: 16px; cursor: pointer; }

.logo-box {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px; transition: transform 0.2s;
}
.logo-box:hover { transform: scale(1.08); }

.sidebar-bottom { display: flex; flex-direction: column; align-items: center; gap: 4px; }

.nav-icon {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 10px; cursor: pointer; transition: all 0.2s; color: var(--el-text-color-placeholder);
}
.nav-icon:hover { background: var(--el-fill-color-light); color: var(--el-text-color-primary); }
.nav-icon.active { background: var(--el-color-danger-light-9); color: var(--el-color-danger); }
.icon-svg { width: 20px; height: 20px; }

/* ═══ 主内容 ═══ */
.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

/* ═══ 顶部栏 ═══ */
.topbar {
  height: 60px; background: var(--el-bg-color); border-bottom: 1px solid var(--el-border-color-light);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 28px; flex-shrink: 0;
}
.topbar-left { display: flex; align-items: baseline; gap: 12px; }
.page-title { font-size: 18px; font-weight: 700; color: var(--el-text-color-primary); margin: 0; }
.page-date { font-size: 12px; color: var(--el-text-color-secondary); }
.topbar-right { display: flex; align-items: center; gap: 12px; }
.search-box { width: 220px; }

:deep(.search-input .el-input__wrapper) { border-radius: 8px; background: var(--el-fill-color-light); box-shadow: none !important; border: 1px solid var(--el-border-color-light); }
:deep(.search-input .el-input__wrapper:hover),
:deep(.search-input .el-input__wrapper.is-focus) { border-color: var(--el-color-danger); }

.new-task-btn { border-radius: 8px !important; font-weight: 600; }

.user-avatar-sidebar {
  width: 32px; height: 32px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
  margin-bottom: 8px;
  transition: transform 0.2s;
}
.user-avatar-sidebar:hover {
  transform: scale(1.05);
}

/* ═══ 页面内容区 ═══ */
.page-content { flex: 1; overflow-y: auto; padding: 24px 28px; }

/* ═══ 用户下拉菜单 ═══ */
.user-dropdown-info {
  display: flex; flex-direction: column; gap: 2px; padding: 4px 0;
}
.ud-name { font-size: 14px; font-weight: 700; color: var(--el-text-color-primary); }
.ud-role { font-size: 11px; color: var(--el-color-success); }
</style>
