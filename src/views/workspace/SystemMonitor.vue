<template>
  <div class="monitor">
    <!-- 系统概况 -->
    <div class="sys-info-bar">
      <div class="sys-item"><span class="sys-label">计算机</span><span class="sys-val">{{ sysInfo.hostname }}</span></div>
      <div class="sys-item"><span class="sys-label">操作系统</span><span class="sys-val">{{ sysInfo.osType }} {{ sysInfo.osRelease }}</span></div>
      <div class="sys-item"><span class="sys-label">CPU</span><span class="sys-val">{{ sysInfo.cpuModel }}</span></div>
      <div class="sys-item"><span class="sys-label">运行时间</span><span class="sys-val">{{ uptime }}</span></div>
    </div>

    <!-- 仪表盘区域 -->
    <div class="gauge-row">
      <div class="gauge-card">
        <h3 class="gauge-title">CPU 使用率</h3>
        <div ref="cpuGaugeRef" class="gauge-chart"></div>
        <div class="gauge-sub">{{ cpuData.average }}% · {{ sysInfo.cpuCores }} 核心</div>
      </div>
      <div class="gauge-card">
        <h3 class="gauge-title">内存使用</h3>
        <div ref="memGaugeRef" class="gauge-chart"></div>
        <div class="gauge-sub">{{ memData.usedGB }} / {{ memData.totalGB }} GB</div>
      </div>
      <div class="gauge-card gpu-card">
        <h3 class="gauge-title">GPU 信息</h3>
        <div class="gpu-info">
          <div class="gpu-icon">🖥️</div>
          <div class="gpu-details">
            <div class="gpu-name">{{ gpuInfo.name }}</div>
            <div class="gpu-row"><span>显存</span><b>{{ gpuInfo.vram }}</b></div>
            <div class="gpu-row"><span>驱动版本</span><b>{{ gpuInfo.driver }}</b></div>
          </div>
        </div>
      </div>
    </div>

    <!-- CPU 核心详情 -->
    <div class="cores-card">
      <h3 class="section-title">CPU 核心使用率</h3>
      <div class="cores-grid">
        <div class="core-item" v-for="c in cpuData.cores" :key="c.core">
          <div class="core-bar-wrap">
            <div class="core-bar" :style="{ height: c.usage + '%', background: coreColor(c.usage) }"></div>
          </div>
          <span class="core-label">核{{ c.core }}</span>
          <span class="core-pct">{{ c.usage }}%</span>
        </div>
      </div>
    </div>

    <!-- CPU 使用率历史趋势 -->
    <div class="trend-card">
      <h3 class="section-title">CPU 使用率趋势 (最近60秒)</h3>
      <div ref="trendChartRef" class="trend-chart"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'

const sysInfo = ref({ hostname: '', osType: '', osRelease: '', cpuModel: '', cpuCores: 0 })
const cpuData = ref({ cores: [], average: 0 })
const memData = ref({ totalGB: '0', usedGB: '0', freeGB: '0', percent: 0 })
const gpuInfo = ref({ name: '加载中...', vram: '—', driver: '—' })
const uptime = ref('')

const cpuGaugeRef = ref(null)
const memGaugeRef = ref(null)
const trendChartRef = ref(null)
let cpuGauge = null
let memGauge = null
let trendChart = null
let pollTimer = null

// 历史数据（60个点）
const historyLabels = ref([])
const historyData = ref([])

function coreColor(usage) {
  if (usage < 40) return '#27ae60'
  if (usage < 70) return '#f39c12'
  return '#e74c3c'
}

function gaugeColor(val) {
  if (val < 40) return '#27ae60'
  if (val < 70) return '#f39c12'
  return '#e74c3c'
}

function makeGaugeOption(value, title) {
  return {
    series: [{
      type: 'gauge',
      startAngle: 220,
      endAngle: -40,
      min: 0,
      max: 100,
      radius: '90%',
      progress: { show: true, width: 14, itemStyle: { color: gaugeColor(value) } },
      axisLine: { lineStyle: { width: 14, color: [[1, '#f0f0f0']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      anchor: { show: false },
      title: { show: false },
      detail: {
        valueAnimation: true,
        fontSize: 28,
        fontWeight: 800,
        color: '#1a1a1a',
        formatter: '{value}%',
        offsetCenter: [0, '10%']
      },
      data: [{ value }]
    }],
    animationDuration: 600,
    animationEasing: 'cubicOut'
  }
}

function initGauges() {
  if (cpuGaugeRef.value) {
    cpuGauge = echarts.init(cpuGaugeRef.value)
    cpuGauge.setOption(makeGaugeOption(0, 'CPU'))
  }
  if (memGaugeRef.value) {
    memGauge = echarts.init(memGaugeRef.value)
    memGauge.setOption(makeGaugeOption(0, 'MEM'))
  }
}

function initTrendChart() {
  if (!trendChartRef.value) return
  // 初始化60个空点
  for (let i = 0; i < 60; i++) {
    historyLabels.value.push('')
    historyData.value.push(0)
  }
  trendChart = echarts.init(trendChartRef.value)
  trendChart.setOption({
    tooltip: { trigger: 'axis', formatter: '{c}%', backgroundColor: '#fff', borderColor: '#eee', borderWidth: 1, textStyle: { color: '#333', fontSize: 12 } },
    grid: { left: 40, right: 20, top: 10, bottom: 30 },
    xAxis: { type: 'category', data: historyLabels.value, axisLabel: { show: false }, axisLine: { lineStyle: { color: '#f0f0f0' } }, axisTick: { show: false } },
    yAxis: { type: 'value', min: 0, max: 100, splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } }, axisLabel: { color: '#bbb', fontSize: 11, formatter: '{value}%' }, axisLine: { show: false }, axisTick: { show: false } },
    series: [{
      type: 'line',
      data: historyData.value,
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2, color: '#e74c3c' },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(231,76,60,0.25)' }, { offset: 1, color: 'rgba(231,76,60,0.02)' }]) }
    }],
    animation: false
  })
}

async function pollData() {
  try {
    // CPU
    const cpu = await window.electronAPI.getCpuUsage()
    cpuData.value = cpu
    cpuGauge?.setOption({ series: [{ data: [{ value: cpu.average }], progress: { itemStyle: { color: gaugeColor(cpu.average) } } }] })

    // Memory
    const mem = window.electronAPI.getMemoryInfo()
    memData.value = mem
    memGauge?.setOption({ series: [{ data: [{ value: mem.percent }], progress: { itemStyle: { color: gaugeColor(mem.percent) } } }] })

    // Uptime
    uptime.value = window.electronAPI.getUptime()

    // 趋势图
    historyData.value.push(cpu.average)
    historyData.value.shift()
    const now = new Date()
    historyLabels.value.push(now.getMinutes() + ':' + String(now.getSeconds()).padStart(2, '0'))
    historyLabels.value.shift()
    trendChart?.setOption({ xAxis: { data: historyLabels.value }, series: [{ data: historyData.value }] })
  } catch (e) {
    console.error('监控数据获取失败', e)
  }
}

function handleResize() {
  cpuGauge?.resize()
  memGauge?.resize()
  trendChart?.resize()
}

onMounted(async () => {
  // 系统基本信息
  try {
    const info = window.electronAPI.getSystemInfo()
    sysInfo.value = info
  } catch {}
  // GPU 信息
  try {
    gpuInfo.value = await window.electronAPI.getGpuInfo()
  } catch {}

  await nextTick()
  initGauges()
  initTrendChart()
  await pollData()
  pollTimer = setInterval(pollData, 2000)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  clearInterval(pollTimer)
  window.removeEventListener('resize', handleResize)
  cpuGauge?.dispose()
  memGauge?.dispose()
  trendChart?.dispose()
})
</script>

<style scoped>
.monitor { display: flex; flex-direction: column; gap: 16px; }

/* 系统概况 */
.sys-info-bar { display: flex; gap: 16px; flex-wrap: wrap; }
.sys-item { flex: 1; min-width: 180px; background: var(--el-bg-color); border-radius: 12px; padding: 14px 18px; border: 1px solid var(--el-border-color-light); display: flex; flex-direction: column; gap: 4px; }
.sys-label { font-size: 11px; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
.sys-val { font-size: 13px; font-weight: 600; color: var(--el-text-color-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* 仪表盘 */
.gauge-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
.gauge-card { background: var(--el-bg-color); border-radius: 12px; padding: 20px; border: 1px solid var(--el-border-color-light); text-align: center; }
.gauge-title { margin: 0 0 4px; font-size: 14px; font-weight: 700; color: var(--el-text-color-primary); }
.gauge-chart { width: 100%; height: 180px; }
.gauge-sub { font-size: 12px; color: var(--el-text-color-secondary); margin-top: -8px; }

/* GPU 卡片 */
.gpu-card { display: flex; flex-direction: column; }
.gpu-info { flex: 1; display: flex; align-items: center; gap: 16px; padding: 20px 0; }
.gpu-icon { font-size: 48px; }
.gpu-details { display: flex; flex-direction: column; gap: 6px; text-align: left; }
.gpu-name { font-size: 15px; font-weight: 700; color: var(--el-text-color-primary); }
.gpu-row { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--el-text-color-secondary); }
.gpu-row b { color: var(--el-text-color-primary); font-weight: 600; }

/* 核心使用率 */
.cores-card { background: var(--el-bg-color); border-radius: 12px; padding: 20px; border: 1px solid var(--el-border-color-light); }
.section-title { margin: 0 0 16px; font-size: 14px; font-weight: 700; color: var(--el-text-color-primary); }
.cores-grid { display: flex; gap: 8px; align-items: flex-end; }
.core-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.core-bar-wrap { width: 100%; height: 80px; background: var(--el-fill-color-light); border-radius: 4px; position: relative; overflow: hidden; display: flex; align-items: flex-end; }
.core-bar { width: 100%; border-radius: 4px 4px 0 0; transition: height 0.5s ease, background 0.5s ease; min-height: 2px; }
.core-label { font-size: 10px; color: var(--el-text-color-secondary); }
.core-pct { font-size: 11px; font-weight: 700; color: var(--el-text-color-primary); }

/* 趋势图 */
.trend-card { background: var(--el-bg-color); border-radius: 12px; padding: 20px; border: 1px solid var(--el-border-color-light); }
.trend-chart { width: 100%; height: 200px; }
</style>
