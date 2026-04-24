<template>
  <div class="login-page">
    <!-- ═══ 左侧品牌展示区 ═══ -->
    <div class="brand-side">
      <!-- 顶部 Logo + 导航 -->
      <div class="brand-header">
        <div class="brand-logo">
          <div class="logo-square">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" stroke="#c8ff00" stroke-width="2"/>
              <path d="M8 12h8M12 8v8" stroke="#c8ff00" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="logo-text">SMART WORKBENCH</span>
        </div>
        <nav class="brand-nav">
          <span class="nav-tag"><span class="nav-icon">✨</span> AI 助手</span>
          <span class="nav-tag"><span class="nav-icon">📊</span> 数据分析</span>
          <span class="nav-tag"><span class="nav-icon">👥</span> 团队协作</span>
        </nav>
      </div>

      <!-- 中间主文案 -->
      <div class="brand-hero">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          <span class="badge-text">AI-POWERED PLATFORM</span>
        </div>
        <h1 class="hero-title">
          智能协作<br/>无边界工作
        </h1>
        <p class="hero-subtitle-en">Intelligent Collaboration. Zero Boundaries.</p>
        <p class="hero-desc">
          整合AI助手、项目管理、数据分析于一体的<br/>
          新一代企业智能工作平台
        </p>
      </div>

      <!-- 底部数据统计 -->
      <div class="brand-stats">
        <div class="stat-item">
          <span class="stat-value">99.9%</span>
          <span class="stat-label">系统可用性</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">500+</span>
          <span class="stat-label">企业客户</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">3x</span>
          <span class="stat-label">效率提升</span>
        </div>
      </div>

      <div class="brand-footer">
        <span>© 2024 Smart Workbench, Enterprise Edition</span>
      </div>

      <!-- 底部快捷功能栏 -->
      <div class="brand-toolbar">
        <span class="toolbar-item">🔍 智能搜索</span>
        <span class="toolbar-divider"></span>
        <span class="toolbar-item">📝 智能文本</span>
      </div>
    </div>

    <!-- ═══ 右侧登录表单区 ═══ -->
    <div class="form-side">
      <div class="form-container">
        <!-- 标题 -->
        <div class="form-header">
          <h2 class="form-title">欢迎回来</h2>
          <p class="form-subtitle">Sign in to Smart Workbench</p>
        </div>

        <!-- 表单 -->
        <el-form :model="userInfo" :rules="rules" ref="loginFormRef" class="login-form" @submit.prevent="handleLogin">
          <div class="field-label">账号 / 邮箱</div>
          <el-form-item prop="username">
            <el-input
              v-model.trim="userInfo.username"
              placeholder="your@company.com"
              size="large"
              :prefix-icon="Message"
            />
          </el-form-item>

          <div class="field-label">密码</div>
          <el-form-item prop="password">
            <el-input
              v-model.trim="userInfo.password"
              type="password"
              placeholder="••••••••••••"
              size="large"
              show-password
              :prefix-icon="Lock"
            />
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="rememberMe" class="remember-check">记住登录状态</el-checkbox>
            <a href="#" class="forgot-link" @click.prevent>忘记密码?</a>
          </div>

          <el-button
            class="login-btn"
            :loading="isLoading"
            @click="handleLogin"
            size="large"
          >
            立即登录 →
          </el-button>

          <div class="divider-row">
            <span class="divider-line"></span>
            <span class="divider-text">或</span>
            <span class="divider-line"></span>
          </div>

          <el-button class="sso-btn" size="large" @click.prevent>
            🔐 企业 SSO 登录
          </el-button>

          <div class="signup-row">
            还没有账号？<a href="#" class="signup-link" @click.prevent>申请试用</a>
          </div>
        </el-form>
      </div>

      <!-- 右下角状态 -->
      <div class="form-footer">
        <div class="footer-left">
          <span class="status-dot online"></span>
          <span class="footer-text">系统正常运行</span>
        </div>
        <span class="footer-text">v2.6.2</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const loginFormRef = ref(null)
const isLoading = ref(false)
const rememberMe = ref(false)
const autoLoggingIn = ref(false)

const userInfo = ref({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入账号或邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// ═══ 记住密码 & 自动登录 ═══
function saveCredentials() {
  if (rememberMe.value) {
    const data = {
      username: userInfo.value.username,
      password: btoa(userInfo.value.password), // Base64 编码（生产环境应使用加密）
      remember: true
    }
    localStorage.setItem('saved-credentials', JSON.stringify(data))
  } else {
    localStorage.removeItem('saved-credentials')
  }
}

function loadCredentials() {
  try {
    const saved = localStorage.getItem('saved-credentials')
    if (saved) {
      const data = JSON.parse(saved)
      userInfo.value.username = data.username || ''
      userInfo.value.password = data.password ? atob(data.password) : ''
      rememberMe.value = data.remember || false
      return true
    }
  } catch {}
  return false
}

function doLogin() {
  saveCredentials()
  sessionStorage.setItem('isLoggedIn', 'true')
  sessionStorage.setItem('username', userInfo.value.username)
  router.push('/workspace')
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  try {
    await loginFormRef.value.validate()
  } catch {
    return
  }
  isLoading.value = true
  setTimeout(() => {
    doLogin()
    isLoading.value = false
  }, 1000)
}

// 页面加载时：如果有保存的凭据，自动登录
onMounted(() => {
  const hasCredentials = loadCredentials()
  const isManualLogout = sessionStorage.getItem('manualLogout') === 'true'
  
  if (hasCredentials && rememberMe.value && userInfo.value.username && userInfo.value.password) {
    if (!isManualLogout) {
      autoLoggingIn.value = true
      // 短暂延迟让用户看到页面，然后自动登录
      setTimeout(() => {
        doLogin()
        autoLoggingIn.value = false
      }, 600)
    } else {
      // 如果是切换用户过来的，不自动登录，但清除标志，保证下次冷启动时还能自动登录
      sessionStorage.removeItem('manualLogout')
    }
  }
})
</script>

<style scoped>
/* ═══════ 页面整体布局 ═══════ */
.login-page {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ═══════ 左侧品牌区 ═══════ */
.brand-side {
  flex: 1;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  padding: 32px 40px 20px;
  position: relative;
  overflow: hidden;
}

/* 装饰网格背景 */
.brand-side::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(200, 255, 0, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200, 255, 0, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}

/* 渐变光晕装饰 */
.brand-side::after {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(200, 255, 0, 0.06) 0%, transparent 70%);
  top: 30%;
  left: -10%;
  pointer-events: none;
}

.brand-header {
  position: relative;
  z-index: 1;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.logo-square {
  width: 36px;
  height: 36px;
  background: rgba(200, 255, 0, 0.1);
  border: 1px solid rgba(200, 255, 0, 0.25);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
}

.brand-nav {
  display: flex;
  gap: 8px;
}

.nav-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  transition: all 0.2s;
}

.nav-tag:hover {
  background: rgba(200, 255, 0, 0.08);
  border-color: rgba(200, 255, 0, 0.2);
  color: #c8ff00;
}

.nav-icon {
  font-size: 13px;
}

/* 主文案 */
.brand-hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #c8ff00;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(200, 255, 0, 0.5);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(200, 255, 0, 0.5); }
  50% { opacity: 0.6; box-shadow: 0 0 16px rgba(200, 255, 0, 0.8); }
}

.badge-text {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  color: rgba(200, 255, 0, 0.8);
  text-transform: uppercase;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  line-height: 1.2;
  color: #fff;
  margin: 0 0 16px;
  letter-spacing: -1px;
}

.hero-subtitle-en {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.35);
  margin: 0 0 16px;
  font-style: italic;
  letter-spacing: 0.5px;
}

.hero-desc {
  font-size: 14px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

/* 数据统计 */
.brand-stats {
  display: flex;
  gap: 48px;
  position: relative;
  z-index: 1;
  padding: 28px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #c8ff00;
  letter-spacing: -0.5px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
}

.brand-footer {
  position: relative;
  z-index: 1;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.2);
  padding-bottom: 8px;
}

/* 底部工具栏 */
.brand-toolbar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  margin-top: 4px;
}

.toolbar-item {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: color 0.2s;
}

.toolbar-item:hover {
  color: #c8ff00;
}

.toolbar-divider {
  width: 1px;
  height: 14px;
  background: rgba(255, 255, 255, 0.1);
}

/* ═══════ 右侧表单区 ═══════ */
.form-side {
  width: 420px;
  background: #111111;
  border-left: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px;
  position: relative;
}

.form-container {
  width: 100%;
  max-width: 340px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: 36px;
}

.form-title {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
}

.form-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
  margin: 0;
}

/* 字段标签 */
.field-label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

/* Element Plus 深色覆盖 */
:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  transition: all 0.25s;
}

:deep(.el-input__wrapper:hover) {
  border-color: rgba(255, 255, 255, 0.18) !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: rgba(200, 255, 0, 0.4) !important;
  box-shadow: 0 0 0 3px rgba(200, 255, 0, 0.06) !important;
}

:deep(.el-input__inner) {
  color: #fff !important;
  font-size: 14px;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.25) !important;
}

:deep(.el-input__prefix .el-icon) {
  color: rgba(255, 255, 255, 0.3) !important;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__error) {
  font-size: 11px;
}

/* 记住密码行 */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

:deep(.remember-check .el-checkbox__label) {
  color: rgba(255, 255, 255, 0.45) !important;
  font-size: 13px;
}

:deep(.remember-check .el-checkbox__inner) {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.2);
}

:deep(.remember-check .el-checkbox__input.is-checked .el-checkbox__inner) {
  background: #c8ff00;
  border-color: #c8ff00;
}

.forgot-link {
  font-size: 13px;
  color: #c8ff00;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;
}

.forgot-link:hover {
  opacity: 0.8;
}

/* 登录按钮 - 荧光绿 */
.login-btn {
  width: 100%;
  height: 46px;
  background: linear-gradient(135deg, #c8ff00 0%, #a8e600 100%) !important;
  border: none !important;
  border-radius: 10px !important;
  color: #0a0a0a !important;
  font-size: 15px !important;
  font-weight: 700 !important;
  letter-spacing: 1px;
  transition: all 0.25s;
  cursor: pointer;
}

.login-btn:hover {
  background: linear-gradient(135deg, #d4ff33 0%, #b8f020 100%) !important;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(200, 255, 0, 0.25);
}

.login-btn:active {
  transform: translateY(0);
}

/* 分割线 */
.divider-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 24px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
}

.divider-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.25);
}

/* SSO 按钮 */
.sso-btn {
  width: 100%;
  height: 44px;
  background: transparent !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 10px !important;
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 14px !important;
  font-weight: 500;
  transition: all 0.2s;
}

.sso-btn:hover {
  border-color: rgba(255, 255, 255, 0.25) !important;
  background: rgba(255, 255, 255, 0.04) !important;
}

/* 注册行 */
.signup-row {
  text-align: center;
  margin-top: 24px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
}

.signup-link {
  color: #c8ff00;
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
  transition: opacity 0.2s;
}

.signup-link:hover {
  opacity: 0.8;
}

/* 右下角状态 */
.form-footer {
  position: absolute;
  bottom: 20px;
  left: 40px;
  right: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-dot.online {
  background: #c8ff00;
  box-shadow: 0 0 6px rgba(200, 255, 0, 0.5);
}

.footer-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.25);
}
</style>
