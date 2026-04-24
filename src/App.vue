<template>
  <!-- ── 更新提示横幅 ───────────────────────────────────────── -->
  <transition name="slide-down">
    <div v-if="updateState.visible" class="update-banner" :class="updateState.type">
      <div class="update-icon">{{ updateState.icon }}</div>
      <div class="update-content">
        <p class="update-title">{{ updateState.title }}</p>
        <p class="update-desc">{{ updateState.desc }}</p>
        <!-- 下载进度条 -->
        <div v-if="updateState.type === 'downloading'" class="progress-wrap">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: updateState.percent + '%' }"></div>
          </div>
          <span class="progress-text">{{ updateState.percent }}%</span>
        </div>
      </div>
      <div class="update-actions">
        <button v-if="updateState.type === 'downloaded'" class="btn-install" @click="installNow">
          立即安装重启
        </button>
        <button v-if="updateState.type !== 'downloading'" class="btn-close" @click="dismissUpdate">✕</button>
      </div>
    </div>
  </transition>

  <!-- ── 开发模式：更新模拟面板 ─────────────────────────────── -->
  <div class="dev-panel">
    <p class="dev-label">🛠 更新测试（开发专用）</p>
    <div class="dev-btns">
      <button class="dev-btn checking"      @click="simulate('checking')">🔍 检查中</button>
      <button class="dev-btn available"     @click="simulate('available')">🚀 发现新版本</button>
      <button class="dev-btn downloading"   @click="simulate('downloading')">⬇️ 下载（带进度）</button>
      <button class="dev-btn not-available" @click="simulate('not-available')">✅ 已最新</button>
      <button class="dev-btn error"         @click="simulate('error')">⚠️ 更新出错</button>
    </div>
  </div>

  <!-- ── 原有页面内容 ─────────────────────────────────────────── -->
  <h1>💖 Hello World!</h1>
  <p>Welcome to your Electron APP.</p>
  <h1>my myElectron</h1>
  <h3>Counter: <span id="counter">{{ counter }}</span></h3>
  <button @click="readTest">读取测试数据</button>
  <span>测试数据文件: </span><h3 id="file-content">测试数据: {{ testcontent }}</h3>
  <button @click="writefile">写入测试数据</button>
  <input type="text" v-model="textValue" placeholder="请输入写入的内容">
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const counter = ref(0)
const testcontent = ref('测试数据')
const textValue = ref('')

// ── 更新状态 ───────────────────────────────────────────────
const updateState = reactive({
  visible: false,
  type: '',     // checking | available | not-available | downloading | downloaded | error
  icon: '',
  title: '',
  desc: '',
  percent: 0,
  version: '',
})

const UPDATE_CONFIG = {
  checking:      { icon: '🔍', title: '检查更新中…',      desc: '正在连接服务器检查最新版本。',          dismissable: true  },
  available:     { icon: '🚀', title: '发现新版本！',     desc: '',                                    dismissable: true  },
  'not-available': { icon: '✅', title: '已是最新版本',    desc: '您的应用已是最新版，无需更新。',        dismissable: true  },
  downloading:   { icon: '⬇️', title: '正在下载更新…',    desc: '请稍候，下载完成后将提示您安装。',      dismissable: false },
  downloaded:    { icon: '✨', title: '更新已就绪！',      desc: '',                                    dismissable: true  },
  error:         { icon: '⚠️', title: '更新出错',          desc: '',                                    dismissable: true  },
}

let dismissTimer = null

function showUpdate(type, extra = {}) {
  const cfg = UPDATE_CONFIG[type]
  if (!cfg) return
  clearTimeout(dismissTimer)
  Object.assign(updateState, {
    visible: true,
    type,
    icon: cfg.icon,
    title: cfg.title,
    desc: cfg.desc,
    percent: extra.percent ?? 0,
    version: extra.version ?? '',
  })
  // 动态描述
  if (type === 'available')  updateState.desc = `新版本 ${extra.version} 已可下载，正在后台下载…`
  if (type === 'downloaded') updateState.desc = `版本 ${extra.version} 下载完毕，点击安装并重启应用。`
  if (type === 'error')      updateState.desc = `错误信息：${extra.message}`
  // 无需交互的状态 3s 后自动消失
  if (['checking', 'not-available'].includes(type)) {
    dismissTimer = setTimeout(dismissUpdate, 3000)
  }
}

function dismissUpdate() {
  updateState.visible = false
}

function installNow() {
  window.electronAPI.installUpdate()
}

// 开发专用：模拟更新阶段
function simulate(stage) {
  window.electronAPI.simulateUpdate(stage)
}

// ── 监听主进程推送的更新事件 ─────────────────────────────
onMounted(() => {
  window.electronAPI.onSetCount((count) => {
    counter.value = count
  })

  window.electronAPI.onUpdateStatus((data) => {
    if (data.event === 'downloading') {
      updateState.percent = data.percent ?? 0
      if (!updateState.visible || updateState.type !== 'downloading') {
        showUpdate('downloading', data)
      } else {
        // 仅刷新进度，不重置整个 banner
        updateState.percent = data.percent
      }
    } else {
      showUpdate(data.event, data)
    }
  })
})

// ── 原有功能 ───────────────────────────────────────────────
const readTest = async () => {
  const data = await window.electronAPI.readFile()
  testcontent.value = data
}

const writefile = async () => {
  const result = await window.electronAPI.writeFile(textValue.value)
  const res = window.electronAPI.showMessage('提示', result)
  console.log(res)
}
</script>

<style scoped>
/* ── 更新横幅 ──────────────────────────────────────────────── */
.update-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,.15);
  backdrop-filter: blur(8px);
  animation: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 颜色主题 */
.update-banner.checking      { background: linear-gradient(135deg,#1e3a5f,#1a5276); border-left: 4px solid #5dade2; }
.update-banner.available     { background: linear-gradient(135deg,#1a5276,#117a65); border-left: 4px solid #1abc9c; }
.update-banner.not-available { background: linear-gradient(135deg,#1e8449,#145a32); border-left: 4px solid #27ae60; }
.update-banner.downloading   { background: linear-gradient(135deg,#6c3483,#4a235a); border-left: 4px solid #a569bd; }
.update-banner.downloaded    { background: linear-gradient(135deg,#784212,#6e2f1a); border-left: 4px solid #f39c12; }
.update-banner.error         { background: linear-gradient(135deg,#7b241c,#641e16); border-left: 4px solid #e74c3c; }

.update-icon { font-size: 28px; flex-shrink: 0; }

.update-content { flex: 1; min-width: 0; }
.update-title   { margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #fff; }
.update-desc    { margin: 0; font-size: 12px; color: rgba(255,255,255,.8); }

/* 进度条 */
.progress-wrap  { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.progress-bar   { flex: 1; height: 6px; background: rgba(255,255,255,.2); border-radius: 3px; overflow: hidden; }
.progress-fill  { height: 100%; background: #a569bd; border-radius: 3px; transition: width .3s ease; }
.progress-text  { font-size: 11px; color: rgba(255,255,255,.9); white-space: nowrap; }

/* 操作按钮 */
.update-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

.btn-install {
  padding: 6px 14px;
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: transform .15s, box-shadow .15s;
}
.btn-install:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(243,156,18,.4); }
.btn-install:active { transform: translateY(0); }

.btn-close {
  width: 28px;
  height: 28px;
  background: rgba(255,255,255,.15);
  color: rgba(255,255,255,.8);
  border: none;
  border-radius: 50%;
  font-size: 13px;
  cursor: pointer;
  transition: background .15s;
}
.btn-close:hover { background: rgba(255,255,255,.3); }

/* ── 入场动画 ──────────────────────────────────────────────── */
.slide-down-enter-active { transition: all .35s cubic-bezier(.25,.8,.25,1); }
.slide-down-leave-active { transition: all .25s ease-in; }
.slide-down-enter-from   { opacity: 0; transform: translateY(-20px); }
.slide-down-leave-to     { opacity: 0; transform: translateY(-20px); }
</style>