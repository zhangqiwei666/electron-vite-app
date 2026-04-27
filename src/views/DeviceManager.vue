<template>
  <div class="device-manager">
    <!-- 顶部操作栏 -->
    <header class="page-header">
      <div class="header-left">
        <div class="title-icon">
          <el-icon><Connection /></el-icon>
        </div>
        <div>
          <h2 class="page-title">设备管理中心</h2>
          <p class="page-subtitle">Hardware & Device Connection Management</p>
        </div>
      </div>
      <div class="header-right">
        <el-button class="glow-btn scan-btn" :loading="isScanning" @click="startScan">
          <el-icon class="btn-icon"><Monitor /></el-icon>
          重新扫描设备
        </el-button>
      </div>
    </header>

    <!-- 主内容区：双列布局 -->
    <div class="content-grid">
      
      <!-- ═══ 左侧：USB 设备管理 ═══ -->
      <section class="device-panel">
        <div class="panel-header">
          <div class="panel-title">
            <el-icon color="#c8ff00"><Connection /></el-icon>
            USB 已连接设备
          </div>
          <el-tag size="small" type="success" effect="dark" class="count-tag">
            {{ usbDevices.length }} 个设备
          </el-tag>
        </div>
        
        <div class="device-list">
          <div v-for="dev in usbDevices" :key="dev.id" class="device-card">
            <div class="device-icon usb-icon">
              <el-icon><Cpu /></el-icon>
            </div>
            <div class="device-info">
              <div class="device-name">{{ dev.name }}</div>
              <div class="device-meta">VID: {{ dev.vendorId }} | PID: {{ dev.productId }}</div>
            </div>
            <div class="device-status">
              <span class="status-dot online"></span>
              <span class="status-text">已连接</span>
            </div>
            <el-button class="ghost-btn" size="small" @click="showDetails(dev)">详情</el-button>
          </div>

          <div v-if="usbDevices.length === 0" class="empty-state">
            <el-icon><Warning /></el-icon>
            <p>未检测到 USB 设备</p>
          </div>
        </div>
      </section>

      <!-- ═══ 右侧：蓝牙设备管理 ═══ -->
      <section class="device-panel">
        <div class="panel-header">
          <div class="panel-title">
            <el-icon color="#c8ff00"><Location /></el-icon>
            蓝牙设备 (Bluetooth)
          </div>
          <el-switch
            v-model="bluetoothEnabled"
            active-color="#c8ff00"
            inactive-color="rgba(255,255,255,0.2)"
          />
        </div>

        <div class="device-list" :class="{ 'disabled-list': !bluetoothEnabled }">
          <div class="list-section-title">当前已连接设备</div>
          <div v-if="connectedBluetoothDevices.length === 0" class="empty-text">暂无连接设备</div>
          <div v-for="dev in connectedBluetoothDevices" :key="'conn-' + dev.id" class="device-card paired">
            <div class="device-icon bt-icon">
              <el-icon><Link /></el-icon>
            </div>
            <div class="device-info">
              <div class="device-name">{{ dev.name }}</div>
              <div class="device-meta">MAC: {{ dev.mac }}</div>
            </div>
            <el-button 
              size="small"
              :class="dev.connected ? 'danger-btn' : 'ghost-btn connect-btn'"
              :type="dev.connected ? 'danger' : ''"
              :loading="dev.connected ? dev.isDisconnecting : dev.isConnecting"
              @click="toggleBluetooth(dev)"
            >
              {{ dev.connected ? (dev.isDisconnecting ? '断开中' : '断开') : (dev.isConnecting ? '连接中' : '连接') }}
            </el-button>
          </div>

          <div class="list-section-title mt-4">历史配对设备</div>
          <div v-if="historicalBluetoothDevices.length === 0" class="empty-text">暂无历史设备</div>
          <div v-for="dev in historicalBluetoothDevices" :key="'hist-' + dev.id" class="device-card paired">
            <div class="device-icon bt-icon-dim">
              <el-icon><Position /></el-icon>
            </div>
            <div class="device-info">
              <div class="device-name historical-name">{{ dev.name }}</div>
              <div class="device-meta">MAC: {{ dev.mac }}</div>
            </div>
            <el-button 
              size="small"
              :class="dev.connected ? 'danger-btn' : 'ghost-btn connect-btn'"
              :type="dev.connected ? 'danger' : ''"
              :loading="dev.connected ? dev.isDisconnecting : dev.isConnecting"
              @click="toggleBluetooth(dev)"
            >
              {{ dev.connected ? (dev.isDisconnecting ? '断开中' : '断开') : (dev.isConnecting ? '连接中' : '连接') }}
            </el-button>
          </div>

          <div class="list-section-title mt-4">发现的 Web BLE 设备</div>
          <div v-for="dev in webBleDevices" :key="dev.id" class="device-card discovered">
            <div class="device-icon bt-icon-dim">
              <el-icon><Position /></el-icon>
            </div>
            <div class="device-info">
              <div class="device-name">{{ dev.name }}</div>
              <div class="device-meta">Status: {{ dev.connected ? '已连接 (GATT)' : '未连接' }}</div>
            </div>
            <el-button 
              size="small"
              :class="dev.connected ? 'danger-btn' : 'ghost-btn connect-btn'"
              :type="dev.connected ? 'danger' : ''"
              :loading="dev.isConnecting"
              @click="toggleWebBle(dev)"
            >
              {{ dev.connected ? '断开' : (dev.isConnecting ? '连接中' : '连接') }}
            </el-button>
          </div>

          <div style="margin-top: 16px; text-align: center;">
            <el-button class="glow-btn" style="width: 100%; height: 44px" @click="requestWebBluetooth">
              <el-icon class="btn-icon"><Monitor /></el-icon>
              通过 Web API 扫描并连接新设备
            </el-button>
          </div>

          <!-- 未开启蓝牙状态 -->
          <div v-if="!bluetoothEnabled" class="overlay-disabled">
            <el-icon class="large-icon"><Close /></el-icon>
            <p>请先开启蓝牙适配器</p>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { 
  Connection, Monitor, Location, Cpu, 
  Warning, Link, Position, Close 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 状态
const isScanning = ref(false)
const bluetoothEnabled = ref(true)

// Mock 数据 - USB（已改为真实数据）
const usbDevices = ref([])

// Mock 数据 - 蓝牙（已改为真实数据）
const pairedBluetoothDevices = ref([])

const connectedBluetoothDevices = computed(() => pairedBluetoothDevices.value.filter(d => d.connected))
const historicalBluetoothDevices = computed(() => pairedBluetoothDevices.value.filter(d => !d.connected))

// 存储 Web Bluetooth 连接的设备实例
const webBleDevices = ref([])

async function fetchRealDevices() {
  if (window.electronAPI) {
    try {
      const usbs = await window.electronAPI.getUsbDevices()
      if (usbs && usbs.length > 0) usbDevices.value = usbs
      
      const bts = await window.electronAPI.getBluetoothDevices()
      if (bts && bts.length > 0) pairedBluetoothDevices.value = bts
    } catch (error) {
      console.error('获取设备信息失败:', error)
    }
  }
}

onMounted(() => {
  fetchRealDevices()
})

// 交互方法
async function startScan() {
  isScanning.value = true
  ElMessage({ message: '正在扫描周围真实设备...', type: 'info', customClass: 'dark-message' })
  await fetchRealDevices()
  setTimeout(() => {
    isScanning.value = false
    ElMessage({ message: '扫描完成，已更新真实设备列表', type: 'success', customClass: 'dark-message' })
  }, 1000)
}

async function connectBluetooth(dev) {
  if (!window.electronAPI) return;
  dev.isConnecting = true;
  try {
    const res = await window.electronAPI.connectBluetooth(dev.deviceId);
    if (res.success) {
      dev.connected = true;
      ElMessage({ message: `已成功连接到 ${dev.name}`, type: 'success', customClass: 'dark-message' })
    }
  } catch (err) {
    ElMessage({ message: `连接失败: ${err.message}`, type: 'error', customClass: 'dark-message' })
  } finally {
    dev.isConnecting = false;
  }
}

async function disconnectBluetooth(dev) {
  if (!window.electronAPI) return;
  dev.isDisconnecting = true;
  try {
    const res = await window.electronAPI.disconnectBluetooth(dev.deviceId);
    if (res.success) {
      dev.connected = false;
      ElMessage({ message: `已断开与 ${dev.name} 的连接`, type: 'warning', customClass: 'dark-message' })
    }
  } catch (err) {
    ElMessage({ message: `断开失败: ${err.message}`, type: 'error', customClass: 'dark-message' })
  } finally {
    dev.isDisconnecting = false;
  }
}

function toggleBluetooth(dev) {
  if (dev.connected) {
    disconnectBluetooth(dev)
  } else {
    connectBluetooth(dev)
  }
}

// ── Web Bluetooth API 原生连接逻辑 ──
async function requestWebBluetooth() {
  try {
    ElMessage({ message: '正在唤起 Web 蓝牙扫描...', type: 'info', customClass: 'dark-message' })
    // 请求蓝牙设备，acceptAllDevices 允许发现所有 BLE 设备
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['battery_service', 'device_information'] // 可以按需添加服务 UUID
    })

    console.log('用户已授权设备:', device)
    
    // 监听设备断开事件
    device.addEventListener('gattserverdisconnected', () => {
      const found = webBleDevices.value.find(d => d.id === device.id)
      if (found) found.connected = false
      ElMessage({ message: `设备 ${device.name} 连接已断开`, type: 'warning', customClass: 'dark-message' })
    })

    // 加入列表
    let devObj = webBleDevices.value.find(d => d.id === device.id)
    if (!devObj) {
      devObj = {
        id: device.id,
        name: device.name || '未知设备',
        connected: false,
        isConnecting: false,
        deviceRef: device // 保存真实的设备实例引用，用于后续通信
      }
      webBleDevices.value.push(devObj)
    }

    // 尝试连接
    await reconnectWebBle(devObj)

  } catch (error) {
    console.error('Web Bluetooth Error:', error)
    ElMessage({ message: '扫描取消或发生错误', type: 'error', customClass: 'dark-message' })
  }
}

async function reconnectWebBle(devObj) {
  devObj.isConnecting = true
  try {
    const server = await devObj.deviceRef.gatt.connect()
    devObj.connected = true
    ElMessage({ message: `通过 Web API 成功接入: ${devObj.name}`, type: 'success', customClass: 'dark-message' })
    console.log('GATT Server:', server)
  } catch (error) {
    console.error('连接 GATT 失败:', error)
    ElMessage({ message: '蓝牙 GATT 连接失败', type: 'error', customClass: 'dark-message' })
  } finally {
    devObj.isConnecting = false
  }
}

function disconnectWebBle(devObj) {
  if (devObj.deviceRef && devObj.deviceRef.gatt.connected) {
    devObj.deviceRef.gatt.disconnect() // 这会触发上面的 gattserverdisconnected 事件
  }
}

function toggleWebBle(devObj) {
  if (devObj.connected) {
    disconnectWebBle(devObj)
  } else {
    reconnectWebBle(devObj)
  }
}

function showDetails(dev) {
  ElMessage({ message: `查看设备详情: ${dev.name}`, type: 'success', customClass: 'dark-message' })
}
</script>

<style scoped>
/* ── 全局与布局 ── */
.device-manager {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── 顶部操作栏 ── */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  width: 44px;
  height: 44px;
  background: rgba(200, 255, 0, 0.1);
  border: 1px solid rgba(200, 255, 0, 0.25);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #8cba00;
  box-shadow: 0 0 15px rgba(200, 255, 0, 0.1);
}

html.dark .title-icon {
  color: #c8ff00;
}

.page-title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.page-subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

/* ── 核心按钮复写 (遵循 SKILL 规范) ── */
.glow-btn {
  background: linear-gradient(135deg, #c8ff00 0%, #a8e600 100%) !important;
  border: none !important;
  border-radius: 10px !important;
  color: #0a0a0a !important;
  font-weight: 700 !important;
  height: 40px;
  padding: 0 20px;
  transition: all 0.25s;
}

.glow-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(200, 255, 0, 0.25);
}

.ghost-btn {
  background: transparent !important;
  border: 1px solid var(--el-border-color) !important;
  color: var(--el-text-color-regular) !important;
  border-radius: 8px !important;
  transition: all 0.2s;
}

.ghost-btn:hover {
  border-color: #8cba00 !important;
  color: #8cba00 !important;
  background: rgba(200, 255, 0, 0.05) !important;
}

html.dark .ghost-btn:hover {
  border-color: #c8ff00 !important;
  color: #c8ff00 !important;
}

.danger-btn {
  background: rgba(231, 76, 60, 0.1) !important;
  border: 1px solid rgba(231, 76, 60, 0.3) !important;
  color: #e74c3c !important;
  border-radius: 8px !important;
}
.danger-btn:hover {
  background: rgba(231, 76, 60, 0.2) !important;
}

.btn-icon { margin-right: 6px; }

/* ── 主内容网格区 ── */
.content-grid {
  display: flex;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

.device-panel {
  flex: 1;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* 渐变装饰线 */
.device-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200, 255, 0, 0.5), transparent);
  opacity: 0.5;
}

.panel-header {
  padding: 18px 24px;
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--el-fill-color-light);
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.count-tag {
  background: rgba(200, 255, 0, 0.1) !important;
  border-color: rgba(200, 255, 0, 0.2) !important;
  color: #8cba00 !important;
  border-radius: 6px;
}

html.dark .count-tag {
  color: #c8ff00 !important;
}

/* ── 列表区域 ── */
.device-list {
  flex: 1;
  padding: 16px 24px;
  overflow-y: auto;
  position: relative;
}

.list-section-title {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 12px;
  font-weight: 600;
  letter-spacing: 1px;
}

.mt-4 { margin-top: 24px; }

/* 设备卡片项 */
.device-card {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
  border-radius: 10px;
  margin-bottom: 12px;
  transition: all 0.25s;
}

.device-card:hover {
  background: var(--el-fill-color);
  border-color: var(--el-border-color);
  transform: translateX(4px);
}

.device-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 16px;
}

.usb-icon { background: rgba(0, 191, 255, 0.1); color: #00bfff; }
.bt-icon { background: rgba(64, 158, 255, 0.1); color: #409eff; }
.bt-icon-dim { background: var(--el-fill-color-darker); color: var(--el-text-color-placeholder); }

.device-info {
  flex: 1;
}

.device-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.historical-name {
  color: var(--el-text-color-placeholder);
}

.device-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: monospace;
}

/* 状态标示 */
.device-status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 20px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.status-dot.online {
  background: #c8ff00;
  box-shadow: 0 0 8px rgba(200, 255, 0, 0.6);
}
.status-text {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

/* 禁用状态与遮罩 */
.disabled-list {
  filter: grayscale(1);
  opacity: 0.3;
  pointer-events: none;
}

.overlay-disabled {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  z-index: 10;
  backdrop-filter: blur(2px);
  background: var(--el-bg-color-overlay);
  opacity: 0.8;
}
.overlay-disabled .large-icon {
  font-size: 32px;
  margin-bottom: 12px;
  color: var(--el-text-color-placeholder);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
.empty-state .el-icon {
  font-size: 36px;
  margin-bottom: 16px;
  color: var(--el-text-color-placeholder);
}

/* ElMessage 样式覆盖 */
:deep(.dark-message) {
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  color: var(--el-text-color-primary);
}

/* ElSwitch 深色覆盖 */
:deep(.el-switch__core) {
  border: 1px solid var(--el-border-color);
}

.empty-text {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  padding: 12px 16px;
  text-align: center;
}
</style>
