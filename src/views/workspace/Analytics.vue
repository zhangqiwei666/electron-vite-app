<template>
  <div class="analytics">
    <!-- 顶部周期选择 -->
    <div class="analytics-toolbar">
      <div class="period-tabs">
        <span class="period-tab" :class="{ active: period === p.key }" v-for="p in periods" :key="p.key" @click="period = p.key">{{ p.label }}</span>
      </div>
      <el-button size="small" plain>导出报表</el-button>
    </div>

    <!-- 核心指标 -->
    <div class="kpi-cards">
      <div class="kpi-card" v-for="k in kpis" :key="k.label">
        <div class="kpi-icon" :style="{ background: k.bg }">{{ k.icon }}</div>
        <div class="kpi-info">
          <span class="kpi-label">{{ k.label }}</span>
          <span class="kpi-value">{{ k.value }}</span>
          <span class="kpi-change" :class="k.changeType">{{ k.change }}</span>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-section">
      <div class="chart-card big">
        <h3 class="chart-title">任务趋势</h3>
        <div ref="barChartRef" class="echart-box"></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-title">任务分布</h3>
        <div ref="pieChartRef" class="echart-box"></div>
      </div>
    </div>

    <!-- 团队排行 -->
    <div class="rank-card">
      <h3 class="chart-title">团队贡献排行</h3>
      <div class="rank-list">
        <div class="rank-item" v-for="(r, i) in ranks" :key="r.name">
          <span class="rank-num" :class="'top' + (i+1)">{{ i + 1 }}</span>
          <span class="rank-name">{{ r.name }}</span>
          <div class="rank-bar-wrap"><div class="rank-bar" :style="{ width: r.percent + '%' }"></div></div>
          <span class="rank-score">{{ r.score }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'

const period = ref('week')
const periods = [
  { key: 'today', label: '今日' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'quarter', label: '季度' },
]

const kpis = [
  { label: '任务完成率', value: '78%', change: '↑ 5%', changeType: 'up', icon: '✅', bg: '#f0fdf4' },
  { label: '平均响应时间', value: '2.4h', change: '↓ 0.8h', changeType: 'up', icon: '⏱', bg: '#eff6ff' },
  { label: '代码合并次数', value: '132', change: '↑ 24', changeType: 'up', icon: '🔀', bg: '#fef3c7' },
  { label: '缺陷修复率', value: '92%', change: '↑ 3%', changeType: 'up', icon: '🐛', bg: '#fef2f2' },
]

const ranks = [
  { name: '张伟', score: 96, percent: 96 },
  { name: '李明', score: 88, percent: 88 },
  { name: '王芳', score: 82, percent: 82 },
  { name: '陈刚', score: 75, percent: 75 },
  { name: '刘洋', score: 68, percent: 68 },
]

// ═══ ECharts ═══
const barChartRef = ref(null)
const pieChartRef = ref(null)
let barChart = null
let pieChart = null

function initBarChart() {
  if (!barChartRef.value) return
  barChart = echarts.init(barChartRef.value)
  barChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: { color: '#333', fontSize: 12 },
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0,0,0,0.03)' } }
    },
    legend: {
      data: ['完成', '新增'],
      bottom: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#999', fontSize: 11 },
      itemGap: 20
    },
    grid: { left: 40, right: 20, top: 16, bottom: 40 },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: '#f0f0f0' } },
      axisTick: { show: false },
      axisLabel: { color: '#999', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } },
      axisLabel: { color: '#bbb', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        name: '完成',
        type: 'bar',
        barWidth: 16,
        barGap: '30%',
        itemStyle: { borderRadius: [4, 4, 0, 0], color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#e74c3c' }, { offset: 1, color: '#c0392b' }]) },
        data: [18, 22, 15, 25, 20, 9, 6]
      },
      {
        name: '新增',
        type: 'bar',
        barWidth: 16,
        itemStyle: { borderRadius: [4, 4, 0, 0], color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#3498db' }, { offset: 1, color: '#2980b9' }]) },
        data: [14, 16, 21, 12, 18, 6, 4]
      }
    ],
    animationDuration: 800,
    animationEasing: 'cubicOut'
  })
}

function initPieChart() {
  if (!pieChartRef.value) return
  pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: { color: '#333', fontSize: 12 },
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      bottom: 10,
      left: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#666', fontSize: 12 },
      itemGap: 10,
      formatter: (name) => {
        const map = { '进行中': '34', '已完成': '30', '待处理': '14', '已关闭': '7' }
        return `${name}  ${map[name] || ''}`
      }
    },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '38%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 3 },
      label: {
        show: true,
        position: 'center',
        formatter: '{total|85}\n{sub|总任务}',
        rich: {
          total: { fontSize: 26, fontWeight: 800, color: '#1a1a1a', lineHeight: 32 },
          sub: { fontSize: 11, color: '#999', lineHeight: 18 }
        }
      },
      emphasis: {
        label: { show: true },
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)' }
      },
      data: [
        { value: 34, name: '进行中', itemStyle: { color: '#e74c3c' } },
        { value: 30, name: '已完成', itemStyle: { color: '#3498db' } },
        { value: 14, name: '待处理', itemStyle: { color: '#f39c12' } },
        { value: 7, name: '已关闭', itemStyle: { color: '#bdc3c7' } },
      ]
    }],
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  })
}

function handleResize() {
  barChart?.resize()
  pieChart?.resize()
}

onMounted(async () => {
  await nextTick()
  initBarChart()
  initPieChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  barChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped>
.analytics { display: flex; flex-direction: column; gap: 16px; }
.analytics-toolbar { display: flex; align-items: center; justify-content: space-between; background: #fff; border-radius: 12px; padding: 10px 20px; border: 1px solid #f0f0f0; }
.period-tabs { display: flex; gap: 4px; }
.period-tab { padding: 6px 16px; border-radius: 8px; font-size: 13px; color: #666; cursor: pointer; transition: all 0.2s; }
.period-tab:hover { background: #f5f5f5; }
.period-tab.active { background: #1a1a1a; color: #fff; }

.kpi-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.kpi-card { background: #fff; border-radius: 12px; padding: 18px; border: 1px solid #f0f0f0; display: flex; align-items: center; gap: 14px; }
.kpi-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.kpi-info { display: flex; flex-direction: column; }
.kpi-label { font-size: 12px; color: #999; }
.kpi-value { font-size: 22px; font-weight: 800; color: #1a1a1a; }
.kpi-change { font-size: 11px; }
.kpi-change.up { color: #27ae60; }
.kpi-change.down { color: #e74c3c; }

.chart-section { display: grid; grid-template-columns: 1fr 360px; gap: 16px; }
.chart-card { background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #f0f0f0; }
.chart-title { margin: 0 0 4px; font-size: 15px; font-weight: 700; color: #1a1a1a; }
.echart-box { width: 100%; height: 280px; }

.rank-card { background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #f0f0f0; }
.rank-list { display: flex; flex-direction: column; gap: 12px; }
.rank-item { display: flex; align-items: center; gap: 12px; }
.rank-num { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; background: #f5f5f5; color: #999; }
.rank-num.top1 { background: #fef3c7; color: #f39c12; }
.rank-num.top2 { background: #f0f0f0; color: #999; }
.rank-num.top3 { background: #fef2f2; color: #e74c3c; }
.rank-name { width: 60px; font-size: 13px; font-weight: 600; color: #333; }
.rank-bar-wrap { flex: 1; height: 8px; background: #f5f5f5; border-radius: 4px; overflow: hidden; }
.rank-bar { height: 100%; background: linear-gradient(90deg, #e74c3c, #f39c12); border-radius: 4px; transition: width 0.8s ease; }
.rank-score { font-size: 14px; font-weight: 700; color: #1a1a1a; width: 32px; text-align: right; }
</style>
